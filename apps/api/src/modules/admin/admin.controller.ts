import { FastifyReply, FastifyRequest } from 'fastify';
import { requireAdmin } from '../../middleware/auth';
import { ok } from '../../utils/response';
import {
  adminListOrdersQuerySchema,
  adminListProductsQuerySchema,
  adminAuditLogsQuerySchema,
  adminLowStockQuerySchema,
  adminOrderIdSchema,
  adminProductIdSchema,
  adminProductUpsertSchema,
  adminSalesQuerySchema,
  adminUpdateOrderStatusSchema,
} from './admin.schemas';
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminCategories,
  getAdminAuditLogs,
  getAdminDashboardSummary,
  getAdminLowStock,
  getAdminOrderDetails,
  getAdminProductDetails,
  getAdminOrders,
  getAdminProducts,
  getAdminSalesAnalytics,
  updateAdminOrderStatus,
  updateAdminProduct,
} from './admin.service';

export const adminDashboardSummaryHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const data = await getAdminDashboardSummary();
  return ok(reply, data);
};

export const adminCategoriesHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const data = await getAdminCategories();
  return ok(reply, data);
};

export const adminProductsListHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const query = adminListProductsQuerySchema.parse(request.query);
  const data = await getAdminProducts(query);
  return ok(reply, data);
};

export const adminProductCreateHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const payload = adminProductUpsertSchema.parse(request.body);
  const data = await createAdminProduct(request.auth!.userId, payload);
  return ok(reply, data, 201);
};

export const adminProductDetailsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const params = adminProductIdSchema.parse(request.params);
  const data = await getAdminProductDetails(params.id);
  return ok(reply, data);
};

export const adminProductUpdateHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const params = adminProductIdSchema.parse(request.params);
  const payload = adminProductUpsertSchema.parse(request.body);
  const data = await updateAdminProduct(request.auth!.userId, params.id, payload);
  return ok(reply, data);
};

export const adminProductDeleteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const params = adminProductIdSchema.parse(request.params);
  const data = await deleteAdminProduct(request.auth!.userId, params.id);
  return ok(reply, data);
};

export const adminOrdersListHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const query = adminListOrdersQuerySchema.parse(request.query);
  const data = await getAdminOrders(query);
  return ok(reply, data);
};

export const adminOrderDetailsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const params = adminOrderIdSchema.parse(request.params);
  const data = await getAdminOrderDetails(params.id);
  return ok(reply, data);
};

export const adminOrderStatusPatchHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const params = adminOrderIdSchema.parse(request.params);
  const body = adminUpdateOrderStatusSchema.parse(request.body);
  const data = await updateAdminOrderStatus(request.auth!.userId, params.id, body.status);
  return ok(reply, data);
};

export const adminLowStockHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const query = adminLowStockQuerySchema.parse(request.query);
  const data = await getAdminLowStock(query);
  return ok(reply, data);
};

export const adminSalesAnalyticsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const query = adminSalesQuerySchema.parse(request.query);
  const data = await getAdminSalesAnalytics(query.days);
  return ok(reply, data);
};

export const adminAuditLogsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const query = adminAuditLogsQuerySchema.parse(request.query);
  const data = await getAdminAuditLogs(query);
  return ok(reply, data);
};
