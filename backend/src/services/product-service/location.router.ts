import { Router, Request, Response } from 'express';

const router = Router();

const CITIES = [
  'All India',
  'Chennai',
  'Bangalore',
  'Hyderabad',
  'Mumbai',
  'Delhi NCR',
  'Coimbatore',
  'Madurai',
  'Kochi',
  'Pune',
  'Kolkata',
];

/**
 * @openapi
 * /locations:
 *   get:
 *     summary: Retrieve available cities/locations for product filtering
 *     tags: [Locations]
 */
router.get('/', (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: CITIES,
  });
});

export const locationRouter = router;
