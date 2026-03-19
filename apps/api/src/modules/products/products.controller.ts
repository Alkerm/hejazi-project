import { FastifyReply, FastifyRequest } from 'fastify';
import { ok } from '../../utils/response';
import { getCategories, getProductDetails, getProducts } from './products.service';
import { listProductsQuerySchema, productBySlugOrIdSchema } from './products.schemas';

export const listProductsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const query = listProductsQuerySchema.parse(request.query);
  const data = await getProducts(query);
  return ok(reply, data);
};

export const productDetailsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const params = productBySlugOrIdSchema.parse(request.params);
  const data = await getProductDetails(params.idOrSlug);
  return ok(reply, data);
};

export const listCategoriesHandler = async (_request: FastifyRequest, reply: FastifyReply) => {
  const data = await getCategories();
  return ok(reply, data);
};
