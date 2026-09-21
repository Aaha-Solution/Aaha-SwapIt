import Redis from 'ioredis';
import { ENV } from '../config/env.config.js';
import { logger } from './logger.js';

class CacheService {
  private redis: Redis | null = null;
  private memoryStore: Map<string, { val: string; exp: number }> = new Map();
  private isRedisAvailable = false;

  constructor() {
    try {
      this.redis = new Redis({
        host: ENV.REDIS_HOST,
        port: ENV.REDIS_PORT,
        password: ENV.REDIS_PASSWORD || undefined,
        retryStrategy: () => null, // Don't crash if Redis is unavailable locally
        lazyConnect: true,
        connectTimeout: 2000,
      });

      this.redis.connect()
        .then(() => {
          this.isRedisAvailable = true;
          logger.info('Connected to Redis cache');
        })
        .catch(() => {
          this.isRedisAvailable = false;
          logger.warn('Redis is not running locally. Falling back to high-performance in-memory cache.');
        });

      this.redis.on('error', () => {
        this.isRedisAvailable = false;
      });
    } catch {
      this.isRedisAvailable = false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isRedisAvailable && this.redis) {
      try {
        return await this.redis.get(key);
      } catch {
        // Fall back to memory
      }
    }
    const item = this.memoryStore.get(key);
    if (!item) return null;
    if (item.exp > 0 && Date.now() > item.exp) {
      this.memoryStore.delete(key);
      return null;
    }
    return item.val;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isRedisAvailable && this.redis) {
      try {
        if (ttlSeconds) {
          await this.redis.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.redis.set(key, value);
        }
        return;
      } catch {
        // Fall back to memory
      }
    }
    const exp = ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0;
    this.memoryStore.set(key, { val: value, exp });
  }

  async del(key: string): Promise<void> {
    if (this.isRedisAvailable && this.redis) {
      try {
        await this.redis.del(key);
      } catch {
        // ignore
      }
    }
    this.memoryStore.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    if (this.isRedisAvailable && this.redis) {
      try {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch {
        // ignore
      }
    }
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const k of this.memoryStore.keys()) {
      if (regex.test(k)) {
        this.memoryStore.delete(k);
      }
    }
  }
}

export const cache = new CacheService();
