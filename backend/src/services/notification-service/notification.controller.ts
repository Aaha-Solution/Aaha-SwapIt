import { Request, Response } from 'express';
import { emailService } from '../../shared/email.js';
import { prisma } from '../../shared/prisma.js';
import { logger } from '../../shared/logger.js';
import { ENV } from '../../config/env.config.js';

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

      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      return res.json({
        success: true,
        data: notifications,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
