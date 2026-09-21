import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { logger } from '../shared/logger.js';
import { ENV } from '../config/env.config.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(
    {
      err,
      method: req.method,
      url: req.url,
      ip: req.ip,
      statusCode,
    },
    `Request Error: ${message}`
  );

  if (ENV.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(ENV.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
