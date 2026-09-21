import { Request, Response } from 'express';
import { prisma } from '../../shared/prisma.js';
import { cache } from '../../shared/redis.js';
import { s3Service } from '../../shared/s3.js';
import { logger } from '../../shared/logger.js';

export const productController = {
  async getProducts(req: Request, res: Response) {
    try {
      const {
        search,
        category,
        city,
        minPrice,
        maxPrice,
        condition,
        sortBy = 'newest',
        page = '1',
        limit = '12',
      } = req.query as Record<string, string>;

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;

      // Check cache for default unfiltered queries
      const cacheKey = `products:list:${search || ''}:${category || ''}:${city || ''}:${minPrice || ''}:${maxPrice || ''}:${sortBy}:${page}:${limit}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // Build Prisma where filter
      const where: any = {
        status: 'active',
      };

      // Search (MySQL search across title and description)
      if (search && search.trim() !== '') {
        const q = search.trim();
        where.OR = [
          { title: { contains: q } },
          { description: { contains: q } },
          { categoryName: { contains: q } },
        ];
      }

      if (category && category !== 'all') {
        where.OR = [
          { categoryName: category.toLowerCase() },
          { category: { slug: category.toLowerCase() } },
        ];
      }

      if (city && city !== 'all') {
        where.city = { equals: city };
      }

      if (condition) {
        where.condition = condition;
      }

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
      }

      // Sorting
      let orderBy: any = { createdAt: 'desc' };
      if (sortBy === 'price-asc') {
        orderBy = { price: 'asc' };
      } else if (sortBy === 'price-desc') {
        orderBy = { price: 'desc' };
      } else if (sortBy === 'featured') {
        orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip,
          take: limitNum,
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                phone: true,
                avatarUrl: true,
                memberSince: true,
                verified: true,
              },
            },
          },
        }),
        prisma.product.count({ where }),
      ]);

      // Format response according to frontend DealKart types
      const formatted = products.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        description: p.description,
        category: p.categoryName,
        categoryId: p.categoryId,
        images: Array.isArray(p.images) ? p.images : [p.imageUrl],
        imageUrl: p.imageUrl,
        location: p.location,
        city: p.city,
        postedAt: p.postedAt,
        condition: p.condition,
        featured: p.featured,
        badge: p.badge,
        badgeText: p.badgeText,
        views: p.views,
        status: p.status,
        seller: {
          id: p.seller.id,
          name: p.seller.name,
          phone: p.seller.phone || undefined,
          avatarUrl: p.seller.avatarUrl || undefined,
          memberSince: p.seller.memberSince || 'Active Member',
          rating: 4.9,
          verified: p.seller.verified,
        },
      }));

      const responsePayload = {
        success: true,
        data: formatted,
        meta: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      };

      // Cache for 60 seconds
      await cache.set(cacheKey, JSON.stringify(responsePayload), 60);

      return res.json(responsePayload);
    } catch (error: any) {
      logger.error({ error }, 'Error fetching products');
      return res.status(500).json({
        success: false,
        message: error.message || 'Error fetching products',
      });
    }
  },

  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatarUrl: true,
              memberSince: true,
              verified: true,
            },
          },
        },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
          data: null,
        });
      }

      // Increment view count asynchronously
      prisma.product
        .update({
          where: { id },
          data: { views: { increment: 1 } },
        })
        .catch(() => {});

      const formatted = {
        id: product.id,
        title: product.title,
        price: product.price,
        description: product.description,
        category: product.categoryName,
        categoryId: product.categoryId,
        images: Array.isArray(product.images) ? product.images : [product.imageUrl],
        imageUrl: product.imageUrl,
        location: product.location,
        city: product.city,
        postedAt: product.postedAt,
        condition: product.condition,
        featured: product.featured,
        badge: product.badge,
        badgeText: product.badgeText,
        views: product.views + 1,
        status: product.status,
        seller: {
          id: product.seller.id,
          name: product.seller.name,
          phone: product.seller.phone || undefined,
          avatarUrl: product.seller.avatarUrl || undefined,
          memberSince: product.seller.memberSince || 'Member',
          rating: 5.0,
          verified: product.seller.verified,
        },
      };

      return res.json({
        success: true,
        data: formatted,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error retrieving product',
      });
    }
  },

  async createProduct(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const {
        title,
        price,
        description,
        category,
        city,
        condition,
        imageUrl,
        images,
        badge,
        badgeText,
      } = req.body;

      if (!title || price === undefined || !description) {
        return res.status(400).json({
          success: false,
          message: 'Title, price, and description are required',
        });
      }

      // Default to demo user if unauthenticated in preview mode
      const sellerId = userId || 'usr-demo-iyyanar';

      // Find or link category
      const matchedCat = await prisma.category.findFirst({
        where: {
          OR: [{ slug: (category || '').toLowerCase() }, { name: category }],
        },
      });

      const newProduct = await prisma.product.create({
        data: {
          title: title.trim(),
          price: parseFloat(price),
          description: description.trim(),
          categoryName: category || 'electronics',
          categoryId: matchedCat?.id || null,
          condition: condition || 'Good',
          city: city || 'Chennai',
          location: `${city || 'Chennai'} • Just now`,
          postedAt: 'Just now',
          imageUrl: imageUrl || '/images/laptop_macbook.png',
          images: images || [imageUrl || '/images/laptop_macbook.png'],
          badge: badge || null,
          badgeText: badgeText || null,
          sellerId,
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatarUrl: true,
              memberSince: true,
              verified: true,
            },
          },
        },
      });

      // Invalidate products cache
      await cache.delPattern('products:list:*');

      return res.status(201).json({
        success: true,
        message: 'Product listed successfully',
        data: {
          id: newProduct.id,
          title: newProduct.title,
          price: newProduct.price,
          description: newProduct.description,
          category: newProduct.categoryName,
          images: Array.isArray(newProduct.images) ? newProduct.images : [newProduct.imageUrl],
          imageUrl: newProduct.imageUrl,
          location: newProduct.location,
          city: newProduct.city,
          postedAt: newProduct.postedAt,
          condition: newProduct.condition,
          seller: {
            id: newProduct.seller.id,
            name: newProduct.seller.name,
            phone: newProduct.seller.phone || undefined,
            memberSince: newProduct.seller.memberSince || 'Just now',
            rating: 5.0,
            verified: newProduct.seller.verified,
          },
        },
      });
    } catch (error: any) {
      logger.error({ error }, 'Error creating product');
      return res.status(500).json({
        success: false,
        message: error.message || 'Error creating product',
      });
    }
  },

  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // Check ownership if authenticated
      if (userId && product.sellerId !== userId && (req as any).user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      await prisma.product.delete({ where: { id } });
      await cache.delPattern('products:list:*');

      return res.json({
        success: true,
        data: true,
        message: 'Product deleted successfully',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error deleting product',
      });
    }
  },

  async uploadImage(req: Request, res: Response) {
    try {
      const { fileName, fileContentBase64, mimeType } = req.body;
      if (!fileName || !fileContentBase64) {
        return res.status(400).json({
          success: false,
          message: 'fileName and fileContentBase64 are required',
        });
      }

      const buffer = Buffer.from(fileContentBase64, 'base64');
      const uploaded = await s3Service.uploadFile(
        buffer,
        fileName,
        mimeType || 'image/jpeg'
      );

      return res.json({
        success: true,
        data: uploaded,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error uploading image to S3',
      });
    }
  },
};
