import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Notification Service Endpoints', () => {
  describe('GET /api/notifications', () => {
    it('should reject unauthenticated request with 401', async () => {
      const response = await request(app).get('/api/notifications');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    it('should reject unauthenticated request with 401', async () => {
      const response = await request(app).put('/api/notifications/read-all');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/notifications/send-email (Admin only)', () => {
    it('should reject unauthenticated request with 401', async () => {
      const response = await request(app)
        .post('/api/notifications/send-email')
        .send({ to: 'user@example.com', subject: 'Test', html: '<p>Hello</p>' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
