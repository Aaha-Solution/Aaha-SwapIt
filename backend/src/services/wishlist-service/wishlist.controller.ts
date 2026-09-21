import { Request, Response } from 'express';
import { prisma } from '../../shared/prisma.js';

export const wishlistController = {
  async getWishlist(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const userId = authUser?.id || 'usr-demo-iyyanar';

      const items = await prisma.wishlistItem.findMany({
        where: { userId },
        include: {
          product: {
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
          },
        },
      });

      const products = items.map((item) => ({
        id: item.product.id,
        title: item.product.title,
        price: item.product.price,
        description: item.product.description,
        category: item.product.categoryName,
        images: Array.isArray(item.product.images) ? item.product.images : [item.product.imageUrl],
        imageUrl: item.product.imageUrl,
        location: item.product.location,
        city: item.product.city,
        postedAt: item.product.postedAt,
        condition: item.product.condition,
        featured: item.product.featured,
        badge: item.product.badge,
        badgeText: item.product.badgeText,
        views: item.product.views,
        status: item.product.status,
        seller: {
          id: item.product.seller.id,
          name: item.product.seller.name,
          phone: item.product.seller.phone || undefined,
          avatarUrl: item.product.seller.avatarUrl || undefined,
          memberSince: item.product.seller.memberSince || 'Member',
          rating: 5.0,
          verified: item.product.seller.verified,
        },
      }));

      return res.json({
        success: true,
        data: products,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async addToWishlist(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const userId = authUser?.id || 'usr-demo-iyyanar';
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({ success: false, message: 'productId is required' });
      }

      await prisma.wishlistItem.upsert({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        update: {},
        create: {
          userId,
          productId,
        },
      });

      return res.json({
        success: true,
        data: true,
        message: 'Product added to wishlist',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async removeFromWishlist(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const userId = authUser?.id || 'usr-demo-iyyanar';
      const { productId } = req.params;

      await prisma.wishlistItem.deleteMany({
        where: {
          userId,
          productId,
        },
      });

      return res.json({
        success: true,
        data: true,
        message: 'Product removed from wishlist',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
