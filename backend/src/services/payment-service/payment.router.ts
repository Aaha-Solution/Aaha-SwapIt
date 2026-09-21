import { Router } from 'express';
import { paymentController } from './payment.controller.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /payments/create-order:
 *   post:
 *     summary: Create a Razorpay order for purchasing/reserving a product
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, amount]
 *             properties:
 *               productId: { type: string, example: "prod-1" }
 *               amount: { type: number, example: 89999 }
 *               currency: { type: string, example: "INR" }
 */
router.post('/create-order', optionalAuth, paymentController.createOrder);

/**
 * @openapi
 * /payments/verify:
 *   post:
 *     summary: Verify Razorpay payment signature & complete transaction
 *     tags: [Payments]
 */
router.post('/verify', optionalAuth, paymentController.verifyPayment);

/**
 * @openapi
 * /payments/webhook:
 *   post:
 *     summary: Razorpay webhook event endpoint
 *     tags: [Payments]
 */
router.post('/webhook', paymentController.handleWebhook);

export const paymentRouter = router;
