import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Products Service Endpoints', () => {
  describe('GET /api/products', () => {
    it('should return 200 and a list of products with metadata', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
    });

    it('should support search query parameters', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ search: 'phone', limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support category and condition filters', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ category: 'electronics', condition: 'Like New' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/products/suggestions', () => {
    it('should return search suggestions', async () => {
      const response = await request(app)
        .get('/api/products/suggestions')
        .query({ q: 'lap' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/categories', () => {
    it('should return the list of categories', async () => {
      const response = await request(app).get('/api/categories');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/locations', () => {
    it('should return the list of locations/cities', async () => {
      const response = await request(app).get('/api/locations');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/products (Protected Listing Creation)', () => {
    it('should return 401 when trying to create product without auth token', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          title: 'MacBook Pro 16 M2',
          price: 120000,
          description: 'Flawless condition, barely used',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
