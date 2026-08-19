import { FastifyInstance } from 'fastify';
import { getMeProfileHandler, updateMeProfileHandler, deleteMeProfileHandler } from './users.controller';

export const usersRoutes = async (app: FastifyInstance) => {
  app.get('/me', getMeProfileHandler);
  app.put('/me', updateMeProfileHandler);
  app.delete('/me', deleteMeProfileHandler);
};
