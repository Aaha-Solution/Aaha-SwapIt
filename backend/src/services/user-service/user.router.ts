import { Router } from 'express';
import { userController } from './user.controller.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 */
router.get('/profile', optionalAuth, userController.getProfile);

/**
 * @openapi
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 */
router.put('/profile', optionalAuth, userController.updateProfile);

/**
 * @openapi
 * /users/my-ads:
 *   get:
 *     summary: Get products listed by the authenticated user
 *     tags: [Users]
 */
router.get('/my-ads', optionalAuth, userController.getMyAds);

export const userRouter = router;
