import { Router } from 'express';
import { productController } from './product.controller.js';
import { optionalAuth, requireAuth } from '../../middleware/auth.middleware.js';
import { productCreateLimiter, uploadLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Retrieve products with filtering, search, and pagination
 *     tags: [Products]
 */
router.get('/', optionalAuth, productController.getProducts);

/**
 * @openapi
 * /products/suggestions:
 *   get:
 *     summary: Retrieve instant search suggestions for products and categories
 *     tags: [Products]
 */
router.get('/suggestions', productController.getSuggestions);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Get single product by ID
 *     tags: [Products]
 */
router.get('/:id', optionalAuth, productController.getProductById);

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Create / Post a new product listing (Authenticated)
 *     tags: [Products]
 */
router.post('/', productCreateLimiter, requireAuth, productController.createProduct);

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     summary: Update product details (Owner / Admin only)
 *     tags: [Products]
 */
router.put('/:id', requireAuth, productController.updateProduct);

/**
 * @openapi
 * /products/{id}/status:
 *   patch:
 *     summary: Update product status (active / sold)
 *     tags: [Products]
 */
router.patch('/:id/status', requireAuth, productController.updateProductStatus);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     summary: Delete a product listing (Owner / Admin only)
 *     tags: [Products]
 */
router.delete('/:id', requireAuth, productController.deleteProduct);

/**
 * @openapi
 * /products/upload-image:
 *   post:
 *     summary: Upload single product media image
 *     tags: [Products]
 */
router.post('/upload-image', uploadLimiter, requireAuth, productController.uploadImage);

/**
 * @openapi
 * /products/upload-images:
 *   post:
 *     summary: Batch upload multiple product media images
 *     tags: [Products]
 */
router.post('/upload-images', uploadLimiter, requireAuth, productController.uploadImages);

export const productRouter = router;

