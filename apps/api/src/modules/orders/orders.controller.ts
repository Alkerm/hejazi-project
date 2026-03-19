import { FastifyReply, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/auth';
import { ok } from '../../utils/response';
import { createOrderSchema, listMyOrdersQuerySchema, orderIdSchema } from './orders.schemas';
import { createOrderFromCart, getMyOrderDetails, getMyOrders } from './orders.service';

export const createOrderHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAuth(request, reply);
  const payload = createOrderSchema.parse(request.body);
  const order = await createOrderFromCart(request.auth!.userId, payload);
  return ok(reply, order, 201);
};

export const listMyOrdersHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAuth(request, reply);
  const query = listMyOrdersQuerySchema.parse(request.query);
  const orders = await getMyOrders(request.auth!.userId, query);
  return ok(reply, orders);
};

export const myOrderDetailsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAuth(request, reply);
  const params = orderIdSchema.parse(request.params);
  const order = await getMyOrderDetails(request.auth!.userId, params.id);
  return ok(reply, order);
};
