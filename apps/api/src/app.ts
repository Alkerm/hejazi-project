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
import { paymentsRoutes } from './modules/payments/payments.routes';
import { wishlistRoutes } from './modules/wishlist/wishlist.routes';
import { reviewsRoutes } from './modules/reviews/reviews.routes';
import { couponsRoutes } from './modules/coupons/coupons.routes';
import { supportRoutes } from './modules/support/support.routes';
import { uploadRoutes } from './modules/upload/upload.routes';
import { driverRoutes } from './modules/driver/driver.routes';
import { policiesRoutes } from './modules/policies/policies.routes';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';

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
  await app.register(fastifyMultipart, { limits: { fileSize: 5 * 1024 * 1024 } });
  await app.register(fastifyStatic, {
    root: path.join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
  });

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
      await v1.register(paymentsRoutes, { prefix: '/payments' });
      await v1.register(wishlistRoutes, { prefix: '/wishlist' });
      await v1.register(reviewsRoutes, { prefix: '/reviews' });
      await v1.register(couponsRoutes, { prefix: '/coupons' });
      await v1.register(supportRoutes, { prefix: '/support' });
      await v1.register(uploadRoutes, { prefix: '/admin/upload' });
      await v1.register(driverRoutes, { prefix: '/driver' });
      await v1.register(policiesRoutes, { prefix: '/policies' });
      await v1.register(policiesRoutes, { prefix: '/admin/policies' });
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
