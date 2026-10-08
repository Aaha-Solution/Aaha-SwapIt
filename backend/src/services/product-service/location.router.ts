import { Router, Request, Response } from 'express';

const router = Router();

const CITIES = [
  'Puducherry',
  'White Town',
  'Heritage Town',
  'Lawspet',
  'Muthialpet',
  'Reddiarpalayam',
  'Villiyanur',
  'Nellithope',
  'Gorimedu',
  'Mudaliarpet',
  'Ariyankuppam',
  'Thattanchavady',
  'Kalapet',
  'Bahour',
  'Karaikal',
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
