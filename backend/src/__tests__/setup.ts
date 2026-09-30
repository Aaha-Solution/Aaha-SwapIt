import { beforeAll, afterAll } from 'vitest';
import { prisma } from '../shared/prisma.js';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch {
    // Ignore disconnect errors during test shutdown
  }
});
