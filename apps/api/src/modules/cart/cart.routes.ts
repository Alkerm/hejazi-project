import { FastifyInstance } from 'fastify';
import {
  addCartItemHandler,
  deleteCartItemHandler,
  getMyCartHandler,
  updateCartItemHandler,
} from './cart.controller';

export const cartRoutes = async (app: FastifyInstance) => {
  app.get('/', getMyCartHandler);
  app.post('/items', addCartItemHandler);
  app.put('/items/:id', updateCartItemHandler);
  app.delete('/items/:id', deleteCartItemHandler);
};
