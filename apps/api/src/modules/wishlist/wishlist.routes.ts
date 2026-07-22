import { FastifyInstance } from 'fastify';
import { getWishlistHandler, toggleWishlistHandler } from './wishlist.controller';

export const wishlistRoutes = async (app: FastifyInstance) => {
  app.get('/', getWishlistHandler);
  app.post('/toggle', toggleWishlistHandler);
};
