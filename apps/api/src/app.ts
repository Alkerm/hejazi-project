import Fastify from 'fastify';
import { env, isProd } from './config/env';
import { registerCorePlugins } from './plugins/core';
import { registerErrorHandler } from './plugins/error-handler';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { productRoutes } from './modules/products/products.routes';
import { cartRoutes } from './modules/cart/cart.routes';
import { ordersRoutes } from './modules/orders/orders.routes';
import { adminRoutes } from './modules/admin/admin.routes';

export const buildApp = async () => {
  const app = Fastify({
    logger: {
      level: isProd ? 'info' : 'debug',
    },
    trustProxy: env.TRUST_PROXY,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
  });

  await registerCorePlugins(app);

  app.get('/health', async () => ({
    success: true,
    data: { status: 'ok' },
  }));

  await app.register(
    async (v1) => {
      await v1.register(authRoutes, { prefix: '/auth' });
      await v1.register(usersRoutes, { prefix: '/users' });
      await v1.register(productRoutes, { prefix: '/products' });
      await v1.register(cartRoutes, { prefix: '/cart' });
      await v1.register(ordersRoutes, { prefix: '/orders' });
      await v1.register(adminRoutes, { prefix: '/admin' });
    },
    { prefix: '/api/v1' },
  );

  registerErrorHandler(app);
  return app;
};

export const startServer = async () => {
  const app = await buildApp();

  await app.listen({
    host: '0.0.0.0',
    port: env.PORT,
  });

  return app;
};
