import { Router, Request, Response } from 'express';
import { prisma } from '../../shared/prisma.js';
import { cache } from '../../shared/redis.js';

const router = Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Retrieve all marketplace categories
 *     tags: [Categories]
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const cached = await cache.get('categories:all');
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached) });
    }

    const categories = await prisma.category.findMany({
      orderBy: { count: 'desc' },
    });

    await cache.set('categories:all', JSON.stringify(categories), 300); // 5 min cache
    return res.json({ success: true, data: categories });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @openapi
 * /categories/{slug}:
 *   get:
 *     summary: Get category by slug
 *     tags: [Categories]
 */
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    return res.json({ success: true, data: category });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export const categoryRouter = router;
