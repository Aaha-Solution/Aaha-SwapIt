import { Router } from 'express';
import { userController } from './user.controller.js';
import { optionalAuth, requireAuth, requireAdmin } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 */
router.get('/profile', requireAuth, userController.getProfile);

/**
 * @openapi
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 */
router.put('/profile', requireAuth, userController.updateProfile);

/**
 * @openapi
 * /users/my-ads:
 *   get:
 *     summary: Get products listed by the authenticated user
 *     tags: [Users]
 */
router.get('/my-ads', optionalAuth, userController.getMyAds);

// --- Admin Endpoints for Seller Management ---
/**
 * @openapi
 * /users/admin/sellers:
 *   post:
 *     summary: Create new Seller account by Admin
 *     tags: [Admin]
 */
router.post('/admin/sellers', requireAuth, requireAdmin, userController.createSellerByAdmin);

/**
 * @openapi
 * /users/admin/sellers:
 *   get:
 *     summary: List all sellers for Admin
 *     tags: [Admin]
 */
router.get('/admin/sellers', requireAuth, requireAdmin, userController.getSellers);

/**
 * @openapi
 * /users/admin/stats:
 *   get:
 *     summary: Get stats overview for Admin
 *     tags: [Admin]
 */
router.get('/admin/stats', requireAuth, requireAdmin, userController.getAdminStats);

/**
 * @openapi
 * /users/admin/sellers/{id}:
 *   delete:
 *     summary: Delete a seller by Admin
 *     tags: [Admin]
 */
router.delete('/admin/sellers/:id', requireAuth, requireAdmin, userController.deleteSeller);

export const userRouter = router;

