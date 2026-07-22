import { FastifyInstance } from 'fastify';
import {
  applyCouponHandler,
  adminListCouponsHandler,
  adminCreateCouponHandler,
  adminToggleCouponHandler,
} from './coupons.controller';

export const couponsRoutes = async (app: FastifyInstance) => {
  app.post('/apply', applyCouponHandler);
  app.get('/admin', adminListCouponsHandler);
  app.post('/admin', adminCreateCouponHandler);
  app.patch('/admin/:id/toggle', adminToggleCouponHandler);
};
