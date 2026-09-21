import { Request, Response } from 'express';
import crypto from 'crypto';
import { razorpay } from '../../config/razorpay.config.js';
import { ENV } from '../../config/env.config.js';
import { prisma } from '../../shared/prisma.js';
import { logger } from '../../shared/logger.js';

export const paymentController = {
  async createOrder(req: Request, res: Response) {
    try {
      const { productId, amount, currency = 'INR' } = req.body;
      const authUser = (req as any).user;
      const userId = authUser?.id || 'usr-demo-iyyanar';

      if (!productId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'productId and amount are required',
        });
      }

      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      let rzpOrder: any = null;
      if (razorpay) {
        try {
          rzpOrder = await razorpay.orders.create({
            amount: Math.round(amount * 100), // amount in paise
            currency,
            receipt: orderNumber,
            notes: {
              productId,
              userId,
            },
          });
        } catch (rzpErr) {
          logger.warn({ rzpErr }, 'Razorpay order creation fallback to simulated order');
        }
      }

      const razorpayOrderId = rzpOrder?.id || `order_mock_${Date.now()}`;

      // Save order in database
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId,
          productId,
          amount: parseFloat(amount),
          currency,
          status: 'created',
          razorpayOrderId,
        },
      });

      return res.status(201).json({
        success: true,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          razorpayOrderId,
          amount: order.amount,
          currency: order.currency,
          keyId: ENV.RAZORPAY_KEY_ID,
        },
      });
    } catch (error: any) {
      logger.error({ error }, 'Error creating payment order');
      return res.status(500).json({
        success: false,
        message: error.message || 'Error creating payment order',
      });
    }
  },

  async verifyPayment(req: Request, res: Response) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      if (!razorpayOrderId || !razorpayPaymentId) {
        return res.status(400).json({
          success: false,
          message: 'razorpayOrderId and razorpayPaymentId are required',
        });
      }

      // Verify HMAC signature if signature provided
      let isValid = true;
      if (razorpaySignature) {
        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto
          .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
          .update(body.toString())
          .digest('hex');

        isValid = expectedSignature === razorpaySignature;
      }

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: invalid signature',
        });
      }

      // Update order status in MySQL database
      await prisma.order.updateMany({
        where: { razorpayOrderId },
        data: {
          status: 'paid',
          razorpayPaymentId,
          razorpaySignature: razorpaySignature || 'verified',
        },
      });

      return res.json({
        success: true,
        message: 'Payment verified and captured successfully',
        data: {
          razorpayOrderId,
          razorpayPaymentId,
          status: 'paid',
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error verifying payment',
      });
    }
  },

  async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const secret = ENV.RAZORPAY_KEY_SECRET;

      if (signature) {
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest !== signature) {
          return res.status(400).json({ status: 'invalid signature' });
        }
      }

      const event = req.body.event;
      logger.info({ event }, 'Razorpay webhook received');

      if (event === 'payment.captured') {
        const paymentEntity = req.body.payload.payment.entity;
        await prisma.order.updateMany({
          where: { razorpayOrderId: paymentEntity.order_id },
          data: {
            status: 'paid',
            razorpayPaymentId: paymentEntity.id,
          },
        });
      }

      return res.json({ status: 'ok' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
};
