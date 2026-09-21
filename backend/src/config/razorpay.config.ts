import Razorpay from 'razorpay';
import { ENV } from './env.config.js';
import { logger } from '../shared/logger.js';

let razorpayInstance: Razorpay | null = null;

try {
  razorpayInstance = new Razorpay({
    key_id: ENV.RAZORPAY_KEY_ID,
    key_secret: ENV.RAZORPAY_KEY_SECRET,
  });
} catch (err) {
  logger.warn('Razorpay initialization notice: using mock/test keys');
}

export const razorpay = razorpayInstance;
