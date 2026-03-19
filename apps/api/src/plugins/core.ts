import { FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { corsOrigins, env, isProd } from '../config/env';

export const registerCorePlugins = async (app: FastifyInstance) => {
  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const allowed = corsOrigins.includes(origin);
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

  await app.register(rateLimit, {
    global: true,
    max: env.GLOBAL_RATE_LIMIT_MAX,
    timeWindow: '1 minute',
  });
};
