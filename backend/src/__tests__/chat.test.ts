import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Chat Service Endpoints', () => {
  describe('GET /api/chat/conversations', () => {
    it('should reject unauthenticated request with 401', async () => {
      const response = await request(app).get('/api/chat/conversations');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/chat/history/:otherUserId', () => {
    it('should reject unauthenticated request with 401', async () => {
      const response = await request(app).get('/api/chat/history/usr-other-123');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
