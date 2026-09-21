import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from '../../config/env.config.js';
import { logger } from '../../shared/logger.js';
import { productRouter } from './product.router.js';
import { categoryRouter } from './category.router.js';
import { locationRouter } from './location.router.js';
import { errorHandler } from '../../middleware/errorHandler.js';

const app = express();
const PORT = process.env.PRODUCT_SERVICE_PORT || 5002;

app.use(helmet());
app.use(cors({ origin: [ENV.CLIENT_URL, 'http://localhost:5173'] }));
app.use(express.json({ limit: '10mb' }));

app.use('/products', productRouter);
app.use('/categories', categoryRouter);
app.use('/locations', locationRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`📦 Product & Catalog Microservice listening independently on port ${PORT}`);
});

export default app;
