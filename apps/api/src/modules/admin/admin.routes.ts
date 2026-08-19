import { FastifyInstance } from 'fastify';
import {
  adminAuditLogsHandler,
  adminCategoriesHandler,
  adminCategoryCreateHandler,
  adminDashboardSummaryHandler,
  adminLowStockHandler,
  adminOrderDetailsHandler,
  adminOrderStatusPatchHandler,
  adminOrderPaymentStatusPatchHandler,
  adminProductDetailsHandler,
  adminOrdersListHandler,
  adminProductCreateHandler,
  adminProductDeleteHandler,
  adminProductUpdateHandler,
  adminProductsListHandler,
  adminSalesAnalyticsHandler,
  adminCustomersOverviewHandler,
  adminBroadcastEmailHandler,
  adminFinancialsHandler,
  adminUpdateProductFinancialsHandler,
} from './admin.controller';

export const adminRoutes = async (app: FastifyInstance) => {
  app.get('/dashboard/summary', adminDashboardSummaryHandler);
  app.get('/categories', adminCategoriesHandler);
  app.post('/categories', adminCategoryCreateHandler);

  app.get('/products', adminProductsListHandler);
  app.post('/products', adminProductCreateHandler);
  app.get('/products/:id', adminProductDetailsHandler);
  app.put('/products/:id', adminProductUpdateHandler);
  app.delete('/products/:id', adminProductDeleteHandler);

  app.get('/orders', adminOrdersListHandler);
  app.get('/orders/:id', adminOrderDetailsHandler);
  app.patch('/orders/:id/status', adminOrderStatusPatchHandler);
  app.patch('/orders/:id/payment', adminOrderPaymentStatusPatchHandler);

  app.get('/customers', adminCustomersOverviewHandler);
  app.post('/customers/broadcast-email', adminBroadcastEmailHandler);

  app.get('/financials', adminFinancialsHandler);
  app.patch('/financials/products/:id', adminUpdateProductFinancialsHandler);

  app.get('/inventory/low-stock', adminLowStockHandler);
  app.get('/analytics/sales', adminSalesAnalyticsHandler);
  app.get('/audit-logs', adminAuditLogsHandler);
};
