import { FastifyInstance } from 'fastify';
import { createPaymentIntentHandler, paymentWebhookHandler, refundPaymentHandler } from './payments.controller';

export const paymentsRoutes = async (app: FastifyInstance) => {
  app.post('/create-intent', createPaymentIntentHandler);
  app.post('/webhook', paymentWebhookHandler);
  app.post('/admin/orders/:id/refund', refundPaymentHandler);
};
