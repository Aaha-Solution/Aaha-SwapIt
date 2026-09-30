import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('User Service Endpoints', () => {
  describe('GET /api/users/profile', () => {
    it('should reject unauthenticated request with 401', async () => {
      const response = await request(app).get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should reject unauthenticated request with 401', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .send({ name: 'New Name' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/users/my-ads', () => {
    it('should return 200 or 401 depending on optional auth handling', async () => {
      const response = await request(app).get('/api/users/my-ads');

      expect([200, 401]).toContain(response.status);
    });
  });

  describe('Admin Endpoints (/api/users/admin/*)', () => {
    it('should reject non-admin request to get sellers with 401', async () => {
      const response = await request(app).get('/api/users/admin/sellers');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject non-admin request to get stats with 401', async () => {
      const response = await request(app).get('/api/users/admin/stats');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
