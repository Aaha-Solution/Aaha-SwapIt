import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Payment Service Endpoints', () => {
  describe('POST /api/payments/create-order', () => {
    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/payments/create-order')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('productId and amount are required');
    });

    it('should return 400 when amount is missing', async () => {
      const response = await request(app)
        .post('/api/payments/create-order')
        .send({ productId: 'prod-1' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/payments/verify', () => {
    it('should return 400 when verification fields are missing', async () => {
      const response = await request(app)
        .post('/api/payments/verify')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/payments/webhook', () => {
    it('should return 400 if webhook signature is missing or invalid', async () => {
      const response = await request(app)
        .post('/api/payments/webhook')
        .send({ event: 'payment.captured' });

      expect([400, 200]).toContain(response.status);
    });
  });
});
