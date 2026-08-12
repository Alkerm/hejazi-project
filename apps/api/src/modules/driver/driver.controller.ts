import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { DriverService } from './driver.service';

const createDriverSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  password: z.string().min(6),
});

const assignRegisteredDriverSchema = z.object({
  driverId: z.string().min(1),
});

const assignDriverSchema = z.object({
  driverName: z.string().min(2),
  driverPhone: z.string().optional(),
});

export const getRegisteredDriversHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = await DriverService.getRegisteredDrivers();
    return reply.send({ success: true, data });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message || 'Failed to fetch registered drivers' });
  }
};

export const createDriverAccountHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const parseResult = createDriverSchema.safeParse(req.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: 'Invalid driver account details', details: parseResult.error.format() });
  }

  try {
    const driver = await DriverService.createDriverAccount(parseResult.data);
    return reply.status(210).send({ success: true, data: driver });
  } catch (err: any) {
    return reply.status(err.statusCode || 400).send({ error: err.message || 'Failed to create driver account' });
  }
};

export const assignRegisteredDriverHandler = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
  const parseResult = assignRegisteredDriverSchema.safeParse(req.body);

  if (!parseResult.success) {
    return reply.status(400).send({ error: 'Invalid request body', details: parseResult.error.format() });
  }

  try {
    const order = await DriverService.assignDriverToOrder(id, parseResult.data.driverId);
    return reply.send({ success: true, data: order });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message || 'Failed to assign order to registered driver' });
  }
};

export const getDeliveryOverviewHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = await DriverService.getDeliveryOverview();
    return reply.send({ success: true, data });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message || 'Failed to fetch delivery overview' });
  }
};

export const getAvailableDeliveriesHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = await DriverService.getAvailableDeliveries();
    return reply.send({ success: true, data });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message || 'Failed to fetch available deliveries' });
  }
};

export const getMyAssignedDeliveriesHandler = async (
  req: FastifyRequest<{ Querystring: { driverName?: string; driverId?: string } }>,
  reply: FastifyReply
) => {
  const driverIdentifier = req.query.driverId || req.query.driverName || 'Driver';
  try {
    const data = await DriverService.getMyAssignedDeliveries(driverIdentifier);
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
    const order = await DriverService.completeDelivery(id, body?.driverName);
    return reply.send({ success: true, data: order });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message || 'Failed to complete delivery' });
  }
};
