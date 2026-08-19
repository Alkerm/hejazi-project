import { FastifyReply, FastifyRequest } from 'fastify';
import { requireAdmin } from '../../middleware/auth';
import { ok } from '../../utils/response';
import {
  adminCreateCategorySchema,
  adminListOrdersQuerySchema,
  adminListProductsQuerySchema,
  adminAuditLogsQuerySchema,
  adminLowStockQuerySchema,
  adminOrderIdSchema,
  adminProductIdSchema,
  adminProductUpsertSchema,
  adminSalesQuerySchema,
  adminUpdateOrderStatusSchema,
  adminListCustomersQuerySchema,
  adminBroadcastEmailSchema,
  adminFinancialsQuerySchema,
  adminUpdateProductFinancialsSchema,
} from './admin.schemas';
import {
  createAdminCategory,
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
  getAdminCustomersOverview,
  sendAdminAnnouncementBroadcast,
  getAdminFinancialOverview,
  updateAdminProductFinancials,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
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

export const adminCategoryCreateHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const payload = adminCreateCategorySchema.parse(request.body);
  const data = await createAdminCategory(request.auth!.userId, payload);
  return ok(reply, data, 201);
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

export const adminOrderPaymentStatusPatchHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const params = adminOrderIdSchema.parse(request.params);
  const body = request.body as { paymentStatus: 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' };
  const data = await updateAdminPaymentStatus(request.auth!.userId, params.id, body.paymentStatus);
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

export const adminCustomersOverviewHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const query = adminListCustomersQuerySchema.parse(request.query);
  const data = await getAdminCustomersOverview(query);
  return ok(reply, data);
};

export const adminBroadcastEmailHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const body = adminBroadcastEmailSchema.parse(request.body);
  const data = await sendAdminAnnouncementBroadcast(request.auth!.userId, body);
  return ok(reply, data, 201);
};

export const adminFinancialsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const query = adminFinancialsQuerySchema.parse(request.query);
  const data = await getAdminFinancialOverview(query);
  return ok(reply, data);
};

export const adminUpdateProductFinancialsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const { id } = adminProductIdSchema.parse(request.params);
  const payload = adminUpdateProductFinancialsSchema.parse(request.body);
  const data = await updateAdminProductFinancials(request.auth!.userId, id, payload);
  return ok(reply, data);
};
