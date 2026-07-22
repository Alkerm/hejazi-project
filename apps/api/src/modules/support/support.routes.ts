import { FastifyInstance } from 'fastify';
import {
  createTicketHandler,
  adminListTicketsHandler,
  adminUpdateTicketHandler,
} from './support.controller';

export const supportRoutes = async (app: FastifyInstance) => {
  app.post('/contact', createTicketHandler);
  app.get('/admin', adminListTicketsHandler);
  app.patch('/admin/:id', adminUpdateTicketHandler);
};
