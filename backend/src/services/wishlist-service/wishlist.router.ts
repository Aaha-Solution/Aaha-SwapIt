import { Router } from 'express';
import { wishlistController } from './wishlist.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /wishlist:
 *   get:
 *     summary: Retrieve user's wishlist products
 *     tags: [Wishlist]
 */
router.get('/', requireAuth, wishlistController.getWishlist);

/**
 * @openapi
 * /wishlist:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Wishlist]
 */
router.post('/', requireAuth, wishlistController.addToWishlist);

/**
 * @openapi
 * /wishlist/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Wishlist]
 */
router.delete('/:productId', requireAuth, wishlistController.removeFromWishlist);

export const wishlistRouter = router;

