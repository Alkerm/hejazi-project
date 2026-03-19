import { FastifyInstance } from 'fastify';
import { loginHandler, logoutHandler, meHandler, registerHandler } from './auth.controller';
import { env } from '../../config/env';

const authRateLimitConfig = {
  config: {
    rateLimit: {
      max: env.AUTH_RATE_LIMIT_MAX,
      timeWindow: '1 minute',
    },
  },
};

export const authRoutes = async (app: FastifyInstance) => {
  app.post('/register', authRateLimitConfig, registerHandler);
  app.post('/login', authRateLimitConfig, loginHandler);
  app.post('/logout', logoutHandler);
  app.get('/me', meHandler);
};
