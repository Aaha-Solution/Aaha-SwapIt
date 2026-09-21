import { Router } from 'express';
import { wishlistController } from './wishlist.controller.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /wishlist:
 *   get:
 *     summary: Retrieve user's wishlist products
 *     tags: [Wishlist]
 */
router.get('/', optionalAuth, wishlistController.getWishlist);

/**
 * @openapi
 * /wishlist:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Wishlist]
 */
router.post('/', optionalAuth, wishlistController.addToWishlist);

/**
 * @openapi
 * /wishlist/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Wishlist]
 */
router.delete('/:productId', optionalAuth, wishlistController.removeFromWishlist);

export const wishlistRouter = router;
