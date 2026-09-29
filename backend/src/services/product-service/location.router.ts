import { Router, Request, Response } from 'express';

const router = Router();

const CITIES = [
  'All Puducherry',
  'White Town',
  'Heritage Town',
  'Lawspet',
  'Muthialpet',
  'Reddiarpalayam',
  'Villianur',
  'Gorimedu / JIPMER',
  'Indira Gandhi Sq',
  'Auroville / Kuilapalayam',
  'Kalapet',
  'Mudaliarpet',
  'Ariankuppam',
  'Thavalakuppam',
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
