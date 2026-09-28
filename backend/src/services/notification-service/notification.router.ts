import { Router } from 'express';
import { notificationController } from './notification.controller.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /notifications/send-email:
 *   post:
 *     summary: Send transactional email via Nodemailer / AWS SES (Admin only)
 *     tags: [Notifications]
 */
router.post('/send-email', requireAdmin, notificationController.sendEmail);

/**
 * @openapi
 * /notifications/send-push:
 *   post:
 *     summary: Send push notification via Firebase Cloud Messaging (Admin only)
 *     tags: [Notifications]
 */
router.post('/send-push', requireAdmin, notificationController.sendPushNotification);

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Get user in-app notifications
 *     tags: [Notifications]
 */
router.get('/', requireAuth, notificationController.getUserNotifications);

/**
 * @openapi
 * /notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 */
router.put('/read-all', requireAuth, notificationController.markAllAsRead);

/**
 * @openapi
 * /notifications/:id/read:
 *   put:
 *     summary: Mark single notification as read
 *     tags: [Notifications]
 */
router.put('/:id/read', requireAuth, notificationController.markAsRead);

/**
 * @openapi
 * /notifications/:id:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 */
router.delete('/:id', requireAuth, notificationController.deleteNotification);

/**
 * @openapi
 * /notifications/create:
 *   post:
 *     summary: Create a notification and broadcast in real-time
 *     tags: [Notifications]
 */
router.post('/create', requireAuth, notificationController.createNotification);

export const notificationRouter = router;

