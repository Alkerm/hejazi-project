import { FastifyInstance } from 'fastify';
import {
  listPoliciesHandler,
  getPolicyBySlugHandler,
  adminUpdatePolicyHandler,
  adminResetPolicyHandler,
} from './policies.controller';

export const policiesRoutes = async (app: FastifyInstance) => {
  // Public storefront routes
  app.get('/', listPoliciesHandler);
  app.get('/:slug', getPolicyBySlugHandler);

  // Admin policy management routes
  app.put('/:slug', adminUpdatePolicyHandler);
  app.post('/:slug/reset', adminResetPolicyHandler);
};
