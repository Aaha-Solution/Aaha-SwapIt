import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.config.js';

describe('Trust & Safety Reports API (/api/reports)', () => {
  const adminToken = jwt.sign(
    { id: 'usr-admin-1', email: 'admin@swapit.com', role: 'admin' },
    ENV.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const userToken = jwt.sign(
    { id: 'usr-buyer-test', email: 'buyer@example.com', role: 'user' },
    ENV.JWT_SECRET,
    { expiresIn: '1h' }
  );

  it('should allow user or guest to submit a safety report', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productId: 'prod-test-flag',
        productTitle: 'Suspicious Luxury Watch',
        productPrice: 1200,
        reason: 'counterfeit',
        description: 'Seller claims original Swiss timepiece but serial number format is invalid.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.reason).toBe('counterfeit');
    expect(res.body.data.status).toBe('pending');
  });

  it('should reject invalid report reason', async () => {
    const res = await request(app)
      .post('/api/reports')
      .send({
        productId: 'prod-123',
        reason: 'non_existent_reason',
        description: 'Some invalid reason text',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject reports with too short description', async () => {
    const res = await request(app)
      .post('/api/reports')
      .send({
        productId: 'prod-123',
        reason: 'fraud_scam',
        description: 'bad',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return safety stats', async () => {
    const res = await request(app).get('/api/reports/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalReports).toBeGreaterThan(0);
    expect(res.body.data.trustSafetyScore).toBeDefined();
  });

  it('should require admin authorization to view moderation queue', async () => {
    const unauthorizedRes = await request(app)
      .get('/api/reports/admin')
      .set('Authorization', `Bearer ${userToken}`);
    expect(unauthorizedRes.status).toBe(403);

    const authorizedRes = await request(app)
      .get('/api/reports/admin')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(authorizedRes.status).toBe(200);
    expect(authorizedRes.body.success).toBe(true);
    expect(Array.isArray(authorizedRes.body.data.reports)).toBe(true);
  });

  it('should allow admin to resolve or take action on a report', async () => {
    // Create a report first
    const createRes = await request(app)
      .post('/api/reports')
      .send({
        productId: 'prod-mod-test',
        productTitle: 'Prohibited Drone without license',
        reason: 'prohibited_item',
        description: 'Selling restricted wireless communication hardware.',
      });

    const reportId = createRes.body.data.id;

    const updateRes = await request(app)
      .patch(`/api/reports/admin/${reportId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'resolved',
        actionTaken: 'listing_removed',
        adminNotes: 'Confirmed violation. Listing was taken down.',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.status).toBe('resolved');
    expect(updateRes.body.data.actionTaken).toBe('listing_removed');
  });
});
