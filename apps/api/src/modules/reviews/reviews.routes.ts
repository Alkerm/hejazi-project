import { FastifyInstance } from 'fastify';
import {
  getProductReviewsHandler,
  submitReviewHandler,
  adminListReviewsHandler,
  adminModerateReviewHandler,
} from './reviews.controller';

export const reviewsRoutes = async (app: FastifyInstance) => {
  app.get('/products/:productId', getProductReviewsHandler);
  app.post('/', submitReviewHandler);
  app.get('/admin', adminListReviewsHandler);
  app.patch('/admin/:id/approve', adminModerateReviewHandler);
};
