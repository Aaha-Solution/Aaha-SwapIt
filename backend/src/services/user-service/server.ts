import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from '../../config/env.config.js';
import { logger } from '../../shared/logger.js';
import { userRouter } from './user.router.js';
import { wishlistRouter } from '../wishlist-service/wishlist.router.js';
import { errorHandler } from '../../middleware/errorHandler.js';

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 5003;

app.use(helmet());
app.use(cors({ origin: [ENV.CLIENT_URL, 'http://localhost:5173'] }));
app.use(express.json());

app.use('/users', userRouter);
app.use('/wishlist', wishlistRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`👤 User & Wishlist Microservice listening independently on port ${PORT}`);
});

export default app;
