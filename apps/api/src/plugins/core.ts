import { FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Redis from 'ioredis';
import { corsOrigins, env, isProd } from '../config/env';
import { AppError } from '../utils/app-error';

export const registerCorePlugins = async (app: FastifyInstance) => {
  const devOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  const allowedOrigins = isProd ? corsOrigins : Array.from(new Set([...corsOrigins, ...devOrigins]));
  const isAllowedOrigin = (origin: string) => allowedOrigins.includes(origin);

  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const allowed = isAllowedOrigin(origin);
      callback(allowed ? null : new Error('Not allowed by CORS'), allowed);
    },
    credentials: true,
  });

  await app.register(helmet, {
    global: true,
    contentSecurityPolicy: isProd ? undefined : false,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' },
    referrerPolicy: { policy: 'no-referrer' },
  });

  await app.register(cookie, {
    secret: env.SESSION_SECRET,
  });

  app.addHook('onRequest', async (request) => {
    const method = request.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return;

    const origin = request.headers.origin;
    if (!origin) return;

    if (!isAllowedOrigin(origin)) {
      throw new AppError('Invalid request origin', 403, 'CSRF_ORIGIN_FORBIDDEN');
    }
  });

  let rateLimitRedis: Redis | undefined;
  if (!env.USE_IN_MEMORY_STORE && env.REDIS_URL) {
    rateLimitRedis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      lazyConnect: false,
      enableReadyCheck: true,
    });

    app.addHook('onClose', async () => {
      await rateLimitRedis!.quit();
    });
  }

  await app.register(rateLimit, {
    global: true,
    max: env.GLOBAL_RATE_LIMIT_MAX,
    timeWindow: '1 minute',
    ...(rateLimitRedis ? { redis: rateLimitRedis } : {}),
  });
};
