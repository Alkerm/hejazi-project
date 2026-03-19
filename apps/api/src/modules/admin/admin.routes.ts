import { FastifyInstance } from 'fastify';
import {
  adminCategoriesHandler,
  adminDashboardSummaryHandler,
  adminLowStockHandler,
  adminOrderDetailsHandler,
  adminOrderStatusPatchHandler,
  adminOrdersListHandler,
  adminProductCreateHandler,
  adminProductDeleteHandler,
  adminProductUpdateHandler,
  adminProductsListHandler,
  adminSalesAnalyticsHandler,
} from './admin.controller';

export const adminRoutes = async (app: FastifyInstance) => {
  app.get('/dashboard/summary', adminDashboardSummaryHandler);
  app.get('/categories', adminCategoriesHandler);

  app.get('/products', adminProductsListHandler);
  app.post('/products', adminProductCreateHandler);
  app.put('/products/:id', adminProductUpdateHandler);
  app.delete('/products/:id', adminProductDeleteHandler);

  app.get('/orders', adminOrdersListHandler);
  app.get('/orders/:id', adminOrderDetailsHandler);
  app.patch('/orders/:id/status', adminOrderStatusPatchHandler);

  app.get('/inventory/low-stock', adminLowStockHandler);
  app.get('/analytics/sales', adminSalesAnalyticsHandler);
};
