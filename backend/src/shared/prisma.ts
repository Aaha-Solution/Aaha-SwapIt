import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

export const prisma =
  global.__prismaClient ||
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prismaClient = prisma;
}

// @ts-expect-error prisma query event typing
prisma.$on('error', (e) => {
  logger.error({ err: e }, 'Prisma DB error');
});
