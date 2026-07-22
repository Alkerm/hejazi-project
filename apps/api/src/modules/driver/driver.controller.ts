import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { DriverService } from './driver.service';

const assignDriverSchema = z.object({
  driverName: z.string().min(2),
  driverPhone: z.string().optional(),
});

export const getAvailableDeliveriesHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = await DriverService.getAvailableDeliveries();
    return reply.send({ success: true, data });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message || 'Failed to fetch available deliveries' });
  }
};

export const getMyAssignedDeliveriesHandler = async (
  req: FastifyRequest<{ Querystring: { driverName?: string } }>,
  reply: FastifyReply
) => {
  const driverName = req.query.driverName || 'Driver';
  try {
    const data = await DriverService.getMyAssignedDeliveries(driverName);
    return reply.send({ success: true, data });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message || 'Failed to fetch driver deliveries' });
  }
};

export const assignDriverHandler = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
  const parseResult = assignDriverSchema.safeParse(req.body);

  if (!parseResult.success) {
    return reply.status(400).send({ error: 'Invalid request body', details: parseResult.error.format() });
  }

  try {
    const order = await DriverService.assignDriver(id, parseResult.data.driverName, parseResult.data.driverPhone);
    return reply.send({ success: true, data: order });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message || 'Failed to assign driver' });
  }
};

export const completeDeliveryHandler = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
  const body = req.body as { driverName?: string };

  try {
    const order = await DriverService.completeDelivery(id, body?.driverName || 'Driver');
    return reply.send({ success: true, data: order });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message || 'Failed to complete delivery' });
  }
};
