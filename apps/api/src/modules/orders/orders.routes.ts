import { FastifyInstance } from 'fastify';
import { createOrderHandler, listMyOrdersHandler, myOrderDetailsHandler } from './orders.controller';

export const ordersRoutes = async (app: FastifyInstance) => {
  app.post('/', createOrderHandler);
  app.get('/me', listMyOrdersHandler);
  app.get('/me/:id', myOrderDetailsHandler);
};
