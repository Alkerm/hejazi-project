import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { PaymentsService } from './payments.service';
import { PaymentMethodType } from '@prisma/client';

const createIntentSchema = z.object({
  orderId: z.string().min(1),
  paymentMethod: z.nativeEnum(PaymentMethodType),
});

const webhookSchema = z.object({
  gateway: z.string(),
  transactionId: z.string(),
  orderId: z.string(),
  amount: z.number(),
  status: z.enum(['PAID', 'FAILED']),
  idempotencyKey: z.string().optional(),
  rawResponse: z.record(z.unknown()).optional(),
});

const refundSchema = z.object({
  reason: z.string().optional(),
});

export const createPaymentIntentHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const userId = req.user?.id;
  if (!userId) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const parseResult = createIntentSchema.safeParse(req.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: 'Invalid request body', details: parseResult.error.format() });
  }

  try {
    const result = await PaymentsService.createPaymentIntent({
      ...parseResult.data,
      userId,
    });
    return reply.send({ success: true, data: result });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message || 'Payment intent creation failed' });
  }
};

export const paymentWebhookHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const parseResult = webhookSchema.safeParse(req.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: 'Invalid webhook payload', details: parseResult.error.format() });
  }

  try {
    const result = await PaymentsService.processWebhookCallback(parseResult.data);
    return reply.send({ success: true, data: result });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message || 'Webhook processing failed' });
  }
};

export const refundPaymentHandler = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const adminUserId = req.user?.id;
  if (!adminUserId || req.user?.role !== 'ADMIN') {
    return reply.status(403).send({ error: 'Forbidden' });
  }

  const { id: orderId } = req.params;
  const parseResult = refundSchema.safeParse(req.body || {});
  const reason = parseResult.success ? parseResult.data.reason : undefined;

  try {
    const order = await PaymentsService.refundPayment(orderId, adminUserId, reason);
    return reply.send({ success: true, data: order });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message || 'Refund failed' });
  }
};
