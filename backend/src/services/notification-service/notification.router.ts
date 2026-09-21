import { Router } from 'express';
import { notificationController } from './notification.controller.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /notifications/send-email:
 *   post:
 *     summary: Send transactional email via Nodemailer / AWS SES
 *     tags: [Notifications]
 */
router.post('/send-email', notificationController.sendEmail);

/**
 * @openapi
 * /notifications/send-push:
 *   post:
 *     summary: Send push notification via Firebase Cloud Messaging (FCM)
 *     tags: [Notifications]
 */
router.post('/send-push', notificationController.sendPushNotification);

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Get user in-app notifications
 *     tags: [Notifications]
 */
router.get('/', optionalAuth, notificationController.getUserNotifications);

export const notificationRouter = router;
