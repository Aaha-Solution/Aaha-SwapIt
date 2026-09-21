import * as Sentry from '@sentry/node';
import { ENV } from './env.config.js';
import { logger } from '../shared/logger.js';

export const initSentry = () => {
  if (ENV.SENTRY_DSN) {
    Sentry.init({
      dsn: ENV.SENTRY_DSN,
      environment: ENV.NODE_ENV,
      tracesSampleRate: 1.0,
    });
    logger.info('Sentry error monitoring initialized');
  } else {
    logger.info('Sentry DSN not provided; running with standard Pino error logging');
  }
};
