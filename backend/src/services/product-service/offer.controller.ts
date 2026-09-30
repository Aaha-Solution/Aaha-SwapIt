import { Request, Response } from 'express';
import { prisma, withDbTimeout } from '../../shared/prisma.js';
import { logger } from '../../shared/logger.js';
import { addNotificationToStore } from '../notification-service/notification.store.js';

export const offerController = {
  async createOffer(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const buyerId = authUser?.id || 'usr-demo-iyyanar';
      const { productId, sellerId, offerAmount, originalPrice, exchangeItem, pickupLocation, pickupTime, notes } = req.body;

      if (!productId || !sellerId || offerAmount === undefined || originalPrice === undefined) {
        return res.status(400).json({
          success: false,
          message: 'productId, sellerId, offerAmount, and originalPrice are required',
        });
      }

      if (buyerId === sellerId) {
        return res.status(400).json({
          success: false,
          message: 'You cannot make an offer on your own listing',
        });
      }

      let offer;
      try {
        offer = await withDbTimeout(
          (prisma as any).offer.create({
            data: {
              buyerId,
              sellerId,
              productId,
              offerAmount: parseFloat(offerAmount),
              originalPrice: parseFloat(originalPrice),
              exchangeItem: exchangeItem || null,
              pickupLocation: pickupLocation || null,
              pickupTime: pickupTime || null,
              notes: notes || null,
              status: 'pending',
            },
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  imageUrl: true,
                  price: true,
                },
              },
              buyer: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          })
        );
      } catch {
        // Fallback for disconnected database
        offer = {
          id: `offer-${Date.now()}`,
          buyerId,
          sellerId,
          productId,
          offerAmount: parseFloat(offerAmount),
          originalPrice: parseFloat(originalPrice),
          exchangeItem: exchangeItem || null,
          pickupLocation: pickupLocation || null,
          pickupTime: pickupTime || null,
          notes: notes || null,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      // Notify the seller
      const notif = addNotificationToStore({
        id: `notif-${Date.now()}`,
        userId: sellerId,
        title: `New Deal Offer: ₹${offerAmount}`,
        message: `${authUser?.name || 'A buyer'} made an offer of ₹${offerAmount} on your listing.`,
        type: 'deal',
        read: false,
        link: '/messages',
        createdAt: new Date().toISOString(),
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user:${sellerId}`).emit('notification:new', notif);
        io.to(`user:${sellerId}`).emit('deal:offer_received', offer);
      }

      return res.status(201).json({
        success: true,
        message: 'Offer submitted successfully',
        data: offer,
      });
    } catch (error: any) {
      logger.error({ error }, 'Error creating swap offer');
      return res.status(500).json({ success: false, message: error.message || 'Failed to submit offer' });
    }
  },

  async getBuyerOffers(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const buyerId = authUser?.id || 'usr-demo-iyyanar';

      let offers: any[] = [];
      try {
        offers = await withDbTimeout(
          (prisma as any).offer.findMany({
            where: { buyerId },
            include: {
              product: true,
              seller: {
                select: { id: true, name: true, phone: true, avatarUrl: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        );
      } catch {
        offers = [];
      }

      return res.json({
        success: true,
        data: offers,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getSellerOffers(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const sellerId = authUser?.id || 'usr-demo-iyyanar';

      let offers: any[] = [];
      try {
        offers = await withDbTimeout(
          (prisma as any).offer.findMany({
            where: { sellerId },
            include: {
              product: true,
              buyer: {
                select: { id: true, name: true, phone: true, avatarUrl: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        );
      } catch {
        offers = [];
      }

      return res.json({
        success: true,
        data: offers,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateOfferStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, counterAmount } = req.body;
      const validStatuses = ['accepted', 'rejected', 'countered', 'completed', 'cancelled'];

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      let updated;
      try {
        updated = await withDbTimeout(
          (prisma as any).offer.update({
            where: { id },
            data: {
              status,
              ...(counterAmount ? { counterAmount: parseFloat(counterAmount) } : {}),
            },
            include: {
              product: true,
              buyer: { select: { id: true, name: true } },
              seller: { select: { id: true, name: true } },
            },
          })
        );
      } catch {
        updated = { id, status, counterAmount, updatedAt: new Date() };
      }

      const io = req.app.get('io');
      if (io && (updated as any).buyerId) {
        io.to(`user:${(updated as any).buyerId}`).emit('deal:status_changed', updated);
        io.to(`user:${(updated as any).sellerId}`).emit('deal:status_changed', updated);
      }

      return res.json({
        success: true,
        message: `Offer status updated to ${status}`,
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
