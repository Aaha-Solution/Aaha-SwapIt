import { Request, Response } from 'express';
import { prisma } from '../../shared/prisma.js';

export const userController = {
  async getProfile(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const targetId = authUser?.id || 'usr-demo-iyyanar';

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
      const targetId = authUser?.id || 'usr-demo-iyyanar';
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
      const sellerId = authUser?.id || 'usr-demo-iyyanar';

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
};
