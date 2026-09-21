import nodemailer from 'nodemailer';
import { ENV } from '../config/env.config.js';
import { logger } from './logger.js';

export const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST,
  port: ENV.SMTP_PORT,
  secure: ENV.SMTP_PORT === 465,
  auth: {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASS,
  },
});

export const emailService = {
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      if (!ENV.SMTP_USER || !ENV.SMTP_PASS) {
        logger.info({ to, subject }, 'SMTP credentials not configured. Simulated email delivery.');
        return true;
      }
      const info = await transporter.sendMail({
        from: ENV.EMAIL_FROM,
        to,
        subject,
        html,
      });
      logger.info({ messageId: info.messageId, to }, 'Email sent successfully');
      return true;
    } catch (error) {
      logger.error({ error, to, subject }, 'Failed to send email');
      return false;
    }
  },
};
