import pino from 'pino';
import { ENV } from '../config/env.config.js';

export const logger = pino({
  level: ENV.LOG_LEVEL,
  transport:
    ENV.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});
