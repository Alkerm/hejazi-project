import { FastifyInstance } from 'fastify';
import {
  getAvailableDeliveriesHandler,
  getMyAssignedDeliveriesHandler,
  assignDriverHandler,
  completeDeliveryHandler,
  getRegisteredDriversHandler,
  createDriverAccountHandler,
  assignRegisteredDriverHandler,
  getDeliveryOverviewHandler,
} from './driver.controller';

export const driverRoutes = async (app: FastifyInstance) => {
  // Admin Driver Management & Delivery Overview
  app.get('/admin/list', getRegisteredDriversHandler);
  app.post('/admin/create', createDriverAccountHandler);
  app.post('/admin/assign/:id', assignRegisteredDriverHandler);
  app.get('/admin/overview', getDeliveryOverviewHandler);

  // Driver Pickup & Delivery Actions
  app.get('/available', getAvailableDeliveriesHandler);
  app.get('/my-deliveries', getMyAssignedDeliveriesHandler);
  app.post('/:id/assign', assignDriverHandler);
  app.post('/:id/complete', completeDeliveryHandler);
};
