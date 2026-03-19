import { FastifyInstance } from 'fastify';
import { getMeProfileHandler, updateMeProfileHandler } from './users.controller';

export const usersRoutes = async (app: FastifyInstance) => {
  app.get('/me', getMeProfileHandler);
  app.put('/me', updateMeProfileHandler);
};
