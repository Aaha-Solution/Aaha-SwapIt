import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Offers & Deals Service Endpoints', () => {
  describe('POST /api/offers', () => {
    it('should reject unauthenticated offer creation with 401', async () => {
      const response = await request(app)
        .post('/api/offers')
        .send({
          productId: 'prod-1',
          sellerId: 'usr-2',
          offerAmount: 380000,
          originalPrice: 450000,
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/offers/buyer', () => {
    it('should reject unauthenticated request with 401', async () => {
      const response = await request(app).get('/api/offers/buyer');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/offers/seller', () => {
    it('should reject unauthenticated request with 401', async () => {
      const response = await request(app).get('/api/offers/seller');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PATCH /api/offers/:id/status', () => {
    it('should reject unauthenticated status update with 401', async () => {
      const response = await request(app)
        .patch('/api/offers/offer-1/status')
        .send({ status: 'accepted' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
