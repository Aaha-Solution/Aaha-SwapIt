import { Router } from 'express';
import { authController } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               name: { type: string, example: "John Doe" }
 *               email: { type: string, example: "john@example.com" }
 *               password: { type: string, example: "SecurePass@123" }
 *               phone: { type: string, example: "+91 98401 23456" }
 *               city: { type: string, example: "Chennai" }
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/signup', authLimiter, authController.signup);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate user & get JWT tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emailOrPhone, password]
 *             properties:
 *               emailOrPhone: { type: string, example: "iyyanar@example.com" }
 *               password: { type: string, example: "Password@123" }
 *     responses:
 *       200:
 *         description: Authentication successful
 */
router.post('/login', authLimiter, authController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh expired JWT access token
 *     tags: [Auth]
 */
router.post('/refresh', authController.refreshToken);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user details
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 */
router.get('/me', requireAuth, authController.getMe);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Revoke refresh token and logout
 *     tags: [Auth]
 */
router.post('/logout', authController.logout);

export const authRouter = router;
