import { FastifyInstance } from 'fastify';
import { listCategoriesHandler, listProductsHandler, productDetailsHandler } from './products.controller';

export const productRoutes = async (app: FastifyInstance) => {
  app.get('/', listProductsHandler);
  app.get('/categories', listCategoriesHandler);
  app.get('/:idOrSlug', productDetailsHandler);
};
