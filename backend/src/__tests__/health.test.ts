import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('GET /api/health', () => {
  it('should return 200 and healthy status information', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('microservices');
    expect(response.body).toHaveProperty('integrations');
    expect(response.body.microservices).toMatchObject({
      authService: 'operational',
      productService: 'operational',
      userService: 'operational',
      wishlistService: 'operational',
      paymentService: 'operational',
      notificationService: 'operational',
    });
  });
});
