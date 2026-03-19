import Redis from 'ioredis';
import { env } from './env';

declare global {
  var redis: Redis | undefined;
}

export const redis =
  globalThis.redis ??
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 2,
    lazyConnect: false,
    enableReadyCheck: true,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.redis = redis;
}
