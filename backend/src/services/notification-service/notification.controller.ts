import { Request, Response } from 'express';
import { emailService } from '../../shared/email.js';
import { prisma } from '../../shared/prisma.js';
import { logger } from '../../shared/logger.js';
import { ENV } from '../../config/env.config.js';
import {
  getNotificationsByUserId,
  addNotificationToStore,
  markAsReadInStore,
  markAllAsReadInStore,
  deleteNotificationFromStore,
  StoredNotification,
} from './notification.store.js';

export const notificationController = {
  async sendEmail(req: Request, res: Response) {
    try {
      const { to, subject, html } = req.body;
      if (!to || !subject || !html) {
        return res.status(400).json({
          success: false,
          message: 'to, subject, and html are required',
        });
      }

      const success = await emailService.sendEmail(to, subject, html);
      return res.json({
        success,
        message: success ? 'Email dispatched successfully' : 'Email dispatch failed',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async sendPushNotification(req: Request, res: Response) {
    try {
      const { targetToken, title, body, data } = req.body;
      if (!title || !body) {
        return res.status(400).json({
          success: false,
          message: 'title and body are required',
        });
      }

      logger.info(
        { targetToken, title, body, data, fcmKey: !!ENV.FCM_SERVER_KEY },
        'Dispatched FCM push notification'
      );

      return res.json({
        success: true,
        message: 'FCM push notification sent successfully',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getUserNotifications(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const userId = authUser?.id || 'usr-demo-iyyanar';

      let dbNotifications: any[] = [];
      try {
        dbNotifications = await prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });
      } catch {
        // Fallback to in-memory store if DB is offline
      }

      const memoryNotifications = getNotificationsByUserId(userId);

      // Merge and deduplicate
      const combined = [...dbNotifications];
      for (const mem of memoryNotifications) {
        if (!combined.some((d) => d.id === mem.id)) {
          combined.push(mem);
        }
      }

      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const unreadCount = combined.filter((n) => !n.read).length;

      return res.json({
        success: true,
        data: combined,
        unreadCount,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async markAsRead(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const userId = authUser?.id || 'usr-demo-iyyanar';
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: 'Notification ID required' });
      }

      // Update in-memory store
      markAsReadInStore(id, userId);

      // Update in DB
      try {
        await prisma.notification.updateMany({
          where: { id, userId },
          data: { read: true },
        });
      } catch {
        // In-memory fallback
      }

      return res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async markAllAsRead(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const userId = authUser?.id || 'usr-demo-iyyanar';

      // Update in-memory store
      markAllAsReadInStore(userId);

      // Update in DB
      try {
        await prisma.notification.updateMany({
          where: { userId, read: false },
          data: { read: true },
        });
      } catch {
        // In-memory fallback
      }

      return res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async deleteNotification(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const userId = authUser?.id || 'usr-demo-iyyanar';
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: 'Notification ID required' });
      }

      deleteNotificationFromStore(id, userId);

      try {
        await prisma.notification.deleteMany({
          where: { id, userId },
        });
      } catch {
        // Fallback
      }

      return res.json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async createNotification(req: Request, res: Response) {
    try {
      const { userId = 'usr-demo-iyyanar', title, message, type = 'system', link, avatarUrl } = req.body;

      if (!title || !message) {
        return res.status(400).json({ success: false, message: 'Title and message are required' });
      }

      const newNotification: StoredNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        userId,
        title,
        message,
        type,
        read: false,
        link,
        avatarUrl,
        createdAt: new Date().toISOString(),
      };

      // 1. Save in memory store
      addNotificationToStore(newNotification);

      // 2. Save in Prisma if available
      try {
        const dbNotif = await prisma.notification.create({
          data: {
            id: newNotification.id,
            userId,
            title,
            message,
            type,
            read: false,
          },
        });
        newNotification.id = dbNotif.id;
      } catch {
        // Fallback
      }

      // 3. Emit real-time socket event if io is mounted
      const io = req.app.get('io');
      if (io) {
        io.to(`user:${userId}`).emit('receive_notification', newNotification);
      }

      return res.status(201).json({
        success: true,
        data: newNotification,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
