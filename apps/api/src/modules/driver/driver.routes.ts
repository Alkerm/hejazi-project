import { FastifyInstance } from 'fastify';
import {
  getAvailableDeliveriesHandler,
  getMyAssignedDeliveriesHandler,
  assignDriverHandler,
  completeDeliveryHandler,
} from './driver.controller';

export const driverRoutes = async (app: FastifyInstance) => {
  app.get('/available', getAvailableDeliveriesHandler);
  app.get('/my-deliveries', getMyAssignedDeliveriesHandler);
  app.post('/:id/assign', assignDriverHandler);
  app.post('/:id/complete', completeDeliveryHandler);
};
