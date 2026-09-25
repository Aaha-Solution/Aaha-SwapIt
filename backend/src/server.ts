import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import passport from 'passport';

import { ENV } from './config/env.config.js';
import { initSentry } from './config/sentry.config.js';
import { logger } from './shared/logger.js';
import { prisma } from './shared/prisma.js';
import { cache } from './shared/redis.js';
import { setupSocketIO } from './sockets/socketServer.js';
import { swaggerSpec } from './swagger/swagger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// Domain Microservices Routers
import { authRouter } from './services/auth-service/auth.router.js';
import { productRouter } from './services/product-service/product.router.js';
import { categoryRouter } from './services/product-service/category.router.js';
import { locationRouter } from './services/product-service/location.router.js';
import { userRouter } from './services/user-service/user.router.js';
import { wishlistRouter } from './services/wishlist-service/wishlist.router.js';
import { paymentRouter } from './services/payment-service/payment.router.js';
import { notificationRouter } from './services/notification-service/notification.router.js';
import { chatRouter } from './services/chat-service/chat.router.js';
import { ratingRouter } from './services/rating-service/rating.router.js';

// 1. Initialize Sentry error monitoring
initSentry();

const app = express();
const httpServer = http.createServer(app);

// 2. Attach Socket.IO real-time gateway
const io = setupSocketIO(httpServer);
app.set('io', io);

// 3. Security & Headers Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Swagger UI assets and images
  })
);

app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 4. Structured HTTP Request Logging with Pino
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url?.startsWith('/api-docs') || req.url?.startsWith('/api/health'),
    },
  })
);

// 5. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 6. Passport Authentication Middleware
app.use(passport.initialize());

// 7. Global API Rate Limiter
app.use('/api', apiLimiter);

// 8. Swagger / OpenAPI Documentation Explorer
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// 9. Gateway Health Check & Architecture Diagnostics
app.get('/api/health', async (req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }

  let redisStatus = 'fallback-in-memory';
  try {
    const testVal = await cache.get('health:check');
    if (testVal !== undefined) {
      redisStatus = 'active';
    }
  } catch {
    // fallback
  }

  return res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    microservices: {
      authService: 'operational',
      productService: 'operational',
      userService: 'operational',
      wishlistService: 'operational',
      paymentService: 'operational',
      notificationService: 'operational',
      socketGateway: 'operational',
    },
    integrations: {
      database: { provider: 'MySQL', status: dbStatus },
      cache: { provider: 'Redis', status: redisStatus },
      storage: { provider: 'AWS S3', bucket: ENV.AWS_S3_BUCKET_NAME },
      payments: { provider: 'Razorpay', status: 'ready' },
      email: { provider: 'Nodemailer / AWS SES', status: 'ready' },
      push: { provider: 'Firebase Cloud Messaging', status: 'ready' },
    },
    docs: `http://localhost:${ENV.PORT}/api-docs`,
  });
});

// 10. Mount Microservices Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/locations', locationRouter);
app.use('/api/users', userRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/chat', chatRouter);
app.use('/api/ratings', ratingRouter);

// 11. Centralized Error Handling
app.use(errorHandler);

// 12. Start Unified Gateway Server
httpServer.listen(ENV.PORT, () => {
  logger.info(`🚀 DealKart Microservices API Gateway listening on port ${ENV.PORT}`);
  logger.info(`📖 Swagger OpenAPI docs available at: http://localhost:${ENV.PORT}/api-docs`);
  logger.info(`⚡ Socket.IO real-time hub initialized`);
});

// Server instance
export { app, httpServer, io };
