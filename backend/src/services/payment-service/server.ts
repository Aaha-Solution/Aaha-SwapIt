import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from '../../config/env.config.js';
import { logger } from '../../shared/logger.js';
import { paymentRouter } from './payment.router.js';
import { errorHandler } from '../../middleware/errorHandler.js';

const app = express();
const PORT = process.env.PAYMENT_SERVICE_PORT || 5004;

app.use(helmet());
app.use(cors({ origin: [ENV.CLIENT_URL, 'http://localhost:5173'] }));
app.use(express.json());

app.use('/', paymentRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`💳 Razorpay Payment Microservice listening independently on port ${PORT}`);
});

export default app;
