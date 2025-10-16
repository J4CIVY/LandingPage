/**
 * Redis Client Configuration
 * Distributed caching and rate limiting with Redis
 * Fallback to in-memory if Redis unavailable (development)
 */

import Redis, { RedisOptions } from 'ioredis';

let redis: Redis | null = null;
const inMemoryCache = new Map<string, { value: any; expiry: number }>();

/**
 * Initialize Redis connection
 * Falls back to in-memory cache if Redis is unavailable
 */
export function getRedisClient(): Redis | null {
  if (!redis && process.env.REDIS_URL) {
    const options: RedisOptions = {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    redis = new Redis(process.env.REDIS_URL, options);

    redis.on('error', (err) => {
      console.error('Redis connection error:', err.message);
      redis = null; // Fallback to in-memory
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
  }

  return redis;
}

/**
 * In-memory fallback for development
 */
class InMemoryRateLimiter {
  async get(key: string): Promise<string | null> {
    const item = inMemoryCache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      inMemoryCache.delete(key);
      return null;
    }
    
    return String(item.value);
  }

  async set(key: string, value: string): Promise<void> {
    inMemoryCache.set(key, { value, expiry: Date.now() + 3600000 }); // 1 hour default
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const newValue = current ? parseInt(current) + 1 : 1;
    inMemoryCache.set(key, { value: newValue, expiry: Date.now() + 60000 });
    return newValue;
  }

  async expire(key: string, seconds: number): Promise<void> {
    const item = inMemoryCache.get(key);
    if (item) {
      item.expiry = Date.now() + (seconds * 1000);
    }
  }

  async del(key: string): Promise<void> {
    inMemoryCache.delete(key);
  }

  async ttl(key: string): Promise<number> {
    const item = inMemoryCache.get(key);
    if (!item) return -2;
    const remaining = Math.floor((item.expiry - Date.now()) / 1000);
    return remaining > 0 ? remaining : -1;
  }
}

const inMemoryLimiter = new InMemoryRateLimiter();

/**
 * Get rate limiter instance (Redis or in-memory fallback)
 */
export function getRateLimiter() {
  const client = getRedisClient();
  return client || inMemoryLimiter;
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
