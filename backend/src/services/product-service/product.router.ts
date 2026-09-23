import { Router } from 'express';
import { productController } from './product.controller.js';
import { optionalAuth, requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Retrieve products with filtering, search, and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search keyword across title and description
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [newest, price-asc, price-desc, featured] }
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/', productController.getProducts);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Get single product by ID
 *     tags: [Products]
 */
router.get('/:id', productController.getProductById);

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Create / Post a new product listing
 *     tags: [Products]
 */
router.post('/', optionalAuth, productController.createProduct);

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     summary: Update product details
 *     tags: [Products]
 */
router.put('/:id', optionalAuth, productController.updateProduct);

/**
 * @openapi
 * /products/{id}/status:
 *   patch:
 *     summary: Update product status (active / sold)
 *     tags: [Products]
 */
router.patch('/:id/status', optionalAuth, productController.updateProductStatus);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     summary: Delete a product listing
 *     tags: [Products]
 */
router.delete('/:id', optionalAuth, productController.deleteProduct);

/**
 * @openapi
 * /products/upload-image:
 *   post:
 *     summary: Upload product media image to AWS S3
 *     tags: [Products]
 */
router.post('/upload-image', requireAuth, productController.uploadImage);

export const productRouter = router;
