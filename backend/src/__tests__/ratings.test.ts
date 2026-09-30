import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Ratings & Review Service Endpoints', () => {
  describe('GET /api/ratings/user/:userId', () => {
    it('should return 200 and reviews for a user', async () => {
      const response = await request(app).get('/api/ratings/user/usr-demo-iyyanar');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('reviews');
      expect(response.body.data).toHaveProperty('summary');
      expect(Array.isArray(response.body.data.reviews)).toBe(true);
      expect(response.body.data.summary).toHaveProperty('averageRating');
      expect(response.body.data.summary).toHaveProperty('totalReviews');
    });
  });

  describe('GET /api/ratings/summary/:userId', () => {
    it('should return 200 and rating summary breakdown', async () => {
      const response = await request(app).get('/api/ratings/summary/usr-demo-iyyanar');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('breakdown');
      expect(response.body.data).toHaveProperty('breakdownPercentages');
      expect(response.body.data).toHaveProperty('averageRating');
      expect(response.body.data).toHaveProperty('totalReviews');
    });
  });

  describe('POST /api/ratings (Protected Review Submission)', () => {
    it('should return 401 when unauthenticated user attempts to submit a review', async () => {
      const response = await request(app)
        .post('/api/ratings')
        .send({
          targetUserId: 'usr-seller-1',
          rating: 5,
          comment: 'Great seller, quick swap!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
