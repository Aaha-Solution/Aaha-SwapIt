import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from '../../config/env.config.js';
import { logger } from '../../shared/logger.js';
import { notificationRouter } from './notification.router.js';
import { errorHandler } from '../../middleware/errorHandler.js';

const app = express();
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 5005;

app.use(helmet());
app.use(cors({ origin: [ENV.CLIENT_URL, 'http://localhost:5173'] }));
app.use(express.json());

app.use('/', notificationRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🔔 Notification Microservice listening independently on port ${PORT}`);
});

export default app;
