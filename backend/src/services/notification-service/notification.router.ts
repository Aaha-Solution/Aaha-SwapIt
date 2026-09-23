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

/**
 * @openapi
 * /notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 */
router.put('/read-all', optionalAuth, notificationController.markAllAsRead);

/**
 * @openapi
 * /notifications/:id/read:
 *   put:
 *     summary: Mark single notification as read
 *     tags: [Notifications]
 */
router.put('/:id/read', optionalAuth, notificationController.markAsRead);

/**
 * @openapi
 * /notifications/:id:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 */
router.delete('/:id', optionalAuth, notificationController.deleteNotification);

/**
 * @openapi
 * /notifications/create:
 *   post:
 *     summary: Create a notification and broadcast in real-time
 *     tags: [Notifications]
 */
router.post('/create', optionalAuth, notificationController.createNotification);

export const notificationRouter = router;
