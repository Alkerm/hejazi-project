import { FastifyReply, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/auth';
import { ok } from '../../utils/response';
import { addCartItemSchema, cartItemIdSchema, updateCartItemSchema } from './cart.schemas';
import { addCartItem, fetchMyCart, removeCartItem, updateCartItem } from './cart.service';

export const getMyCartHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAuth(request, reply);
  const cart = await fetchMyCart(request.auth!.userId);
  return ok(reply, cart);
};

export const addCartItemHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAuth(request, reply);
  const payload = addCartItemSchema.parse(request.body);
  const cart = await addCartItem(request.auth!.userId, payload);
  return ok(reply, cart, 201);
};

export const updateCartItemHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAuth(request, reply);
  const params = cartItemIdSchema.parse(request.params);
  const body = updateCartItemSchema.parse(request.body);
  const cart = await updateCartItem(request.auth!.userId, params.id, body.quantity);
  return ok(reply, cart);
};

export const deleteCartItemHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAuth(request, reply);
  const params = cartItemIdSchema.parse(request.params);
  const cart = await removeCartItem(request.auth!.userId, params.id);
  return ok(reply, cart);
};
