import { app, httpServer, io } from './app.js';
import { ENV } from './config/env.config.js';
import { logger } from './shared/logger.js';

// Start Unified Gateway Server
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(ENV.PORT, () => {
    logger.info(`🚀 DealKart Microservices API Gateway listening on port ${ENV.PORT}`);
    logger.info(`📖 Swagger OpenAPI docs available at: http://localhost:${ENV.PORT}/api-docs`);
    logger.info(`⚡ Socket.IO real-time hub initialized`);
  });
}

// Server instance
export { app, httpServer, io };
