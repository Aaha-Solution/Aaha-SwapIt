import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../../shared/prisma.js';

export const userController = {
  async getProfile(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const targetId = authUser?.id || 'usr-demo-admin';

      const user = await prisma.user.findUnique({
        where: { id: targetId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          location: true,
          avatarUrl: true,
          memberSince: true,
          verified: true,
          role: true,
        },
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const targetId = authUser?.id || 'usr-demo-admin';
      const { name, phone, location, avatarUrl } = req.body;

      const updated = await prisma.user.update({
        where: { id: targetId },
        data: {
          ...(name && { name: name.trim() }),
          ...(phone !== undefined && { phone }),
          ...(location && { location }),
          ...(avatarUrl && { avatarUrl }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          location: true,
          avatarUrl: true,
          memberSince: true,
          verified: true,
          role: true,
        },
      });

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getMyAds(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const sellerId = authUser?.id || 'usr-demo-seller';

      const products = await prisma.product.findMany({
        where: { sellerId },
        orderBy: { createdAt: 'desc' },
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

      const formatted = products.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        description: p.description,
        category: p.categoryName,
        imageUrl: p.imageUrl,
        images: Array.isArray(p.images) ? p.images : [p.imageUrl],
        location: p.location,
        city: p.city,
        postedAt: p.postedAt,
        condition: p.condition,
        views: p.views,
        status: p.status,
        seller: {
          id: p.seller.id,
          name: p.seller.name,
          phone: p.seller.phone || undefined,
          memberSince: p.seller.memberSince || 'Active Member',
          rating: 5.0,
          verified: p.seller.verified,
        },
      }));

      return res.json({
        success: true,
        data: formatted,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Admin creates a verified Seller account (like OLX authorized seller onboarding)
  async createSellerByAdmin(req: Request, res: Response) {
    try {
      const { name, email, phone, location, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Seller Name, Email, and Initial Password are required',
        });
      }

      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: `An account with email "${email}" already exists.`,
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newSeller = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone?.trim() || null,
          location: location?.trim() || 'Chennai',
          password: passwordHash,
          role: 'seller',
          verified: true,
          memberSince: 'Sep 2026',
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          location: true,
          role: true,
          verified: true,
          memberSince: true,
          createdAt: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Seller account created successfully by Admin',
        data: newSeller,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error creating seller account',
      });
    }
  },

  // List all sellers for Admin
  async getSellers(req: Request, res: Response) {
    try {
      const sellers = await prisma.user.findMany({
        where: { role: 'seller' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          location: true,
          verified: true,
          role: true,
          memberSince: true,
          createdAt: true,
          _count: {
            select: { products: true },
          },
        },
      });

      return res.json({
        success: true,
        data: sellers,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error fetching sellers',
      });
    }
  },

  // Get Admin Dashboard Overview stats
  async getAdminStats(req: Request, res: Response) {
    try {
      const [totalUsers, totalSellers, totalCustomers, totalProducts] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'seller' } }),
        prisma.user.count({ where: { OR: [{ role: 'customer' }, { role: 'user' }] } }),
        prisma.product.count(),
      ]);

      return res.json({
        success: true,
        data: {
          totalUsers,
          totalSellers,
          totalCustomers,
          totalProducts,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error fetching stats',
      });
    }
  },

  // Delete a seller by Admin
  async deleteSeller(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const seller = await prisma.user.findUnique({
        where: { id },
      });

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Seller not found',
        });
      }

      await prisma.user.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: 'Seller removed successfully',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error deleting seller',
      });
    }
  },
};
