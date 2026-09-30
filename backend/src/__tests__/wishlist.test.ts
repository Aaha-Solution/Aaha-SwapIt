import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Wishlist Service Endpoints', () => {
  describe('GET /api/wishlist', () => {
    it('should reject unauthenticated request with 401', async () => {
      const response = await request(app).get('/api/wishlist');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/wishlist', () => {
    it('should reject unauthenticated request with 401', async () => {
      const response = await request(app)
        .post('/api/wishlist')
        .send({ productId: 'prod-1' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/wishlist/:productId', () => {
    it('should reject unauthenticated request with 401', async () => {
      const response = await request(app).delete('/api/wishlist/prod-1');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
