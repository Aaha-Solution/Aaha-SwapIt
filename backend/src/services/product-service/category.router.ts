import { Router, Request, Response } from 'express';
import { prisma } from '../../shared/prisma.js';
import { cache } from '../../shared/redis.js';

const FALLBACK_CATEGORIES = [
  { id: 'cat-cars', name: 'Cars', slug: 'cars', icon: 'Car', count: 42 },
  { id: 'cat-bikes', name: 'Bikes', slug: 'bikes', icon: 'Bike', count: 28 },
  { id: 'cat-mobiles', name: 'Mobiles & Tablets', slug: 'mobiles', icon: 'Smartphone', count: 65 },
  { id: 'cat-electronics', name: 'Electronics', slug: 'electronics', icon: 'Tv', count: 37 },
  { id: 'cat-properties', name: 'Properties', slug: 'properties', icon: 'Building2', count: 19 },
  { id: 'cat-furniture', name: 'Furniture', slug: 'furniture', icon: 'Armchair', count: 53 },
  { id: 'cat-fashion', name: 'Fashion', slug: 'fashion', icon: 'Shirt', count: 88 },
  { id: 'cat-pets', name: 'Pets', slug: 'pets', icon: 'Dog', count: 15 },
  { id: 'cat-books', name: 'Books & Hobbies', slug: 'books', icon: 'BookOpen', count: 40 },
  { id: 'cat-services', name: 'Services', slug: 'services', icon: 'Wrench', count: 22 },
  { id: 'cat-jobs', name: 'Jobs', slug: 'jobs', icon: 'Briefcase', count: 14 },
];

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
  } catch {
    // Instant fallback when database is disconnected
    return res.json({ success: true, data: FALLBACK_CATEGORIES });
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
      const fallback = FALLBACK_CATEGORIES.find((c) => c.slug === slug);
      if (fallback) return res.json({ success: true, data: fallback });
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    return res.json({ success: true, data: category });
  } catch {
    const { slug } = req.params;
    const fallback = FALLBACK_CATEGORIES.find((c) => c.slug === slug);
    if (fallback) return res.json({ success: true, data: fallback });
    return res.status(404).json({ success: false, message: 'Category not found' });
  }
});

export const categoryRouter = router;

