import { OrderStatus, Prisma } from '@prisma/client';
import { env } from '../../config/env';
import { prisma } from '../../prisma/client';
import { AppError } from '../../utils/app-error';
import { toMoney } from '../../utils/money';
import { normalizePagination } from '../../utils/pagination';
import { slugify } from '../../utils/slug';
import { invalidateProductCaches } from '../products/products.service';
import {
  createAuditLog,
  createProductRepo,
  deleteProductRepo,
  findAdminOrderByIdRepo,
  findProductByIdRepo,
  getDashboardSummaryCountsRepo,
  getLowStockProductsRepo,
  getOutOfStockCountRepo,
  getRecentOrdersRepo,
  getRevenueAggregateRepo,
  getSalesByDayRepo,
  getTopSellingProductsRepo,
  listAdminOrdersRepo,
  listAdminProductsRepo,
  listCategoriesRepo,
  updateAdminOrderStatusRepo,
  updateProductRepo,
} from './admin.repository';

export const getAdminDashboardSummary = async () => {
  const [{ productsCount, lowStockCount, pendingOrdersCount, usersCount }, revenue, recentOrders, topProducts] =
    await Promise.all([
      getDashboardSummaryCountsRepo(env.LOW_STOCK_THRESHOLD),
      getRevenueAggregateRepo(),
      getRecentOrdersRepo(8),
      getTopSellingProductsRepo(5),
    ]);

  return {
    cards: {
      productsCount,
      lowStockCount,
      pendingOrdersCount,
      usersCount,
      totalRevenue: toMoney(revenue.totalRevenue),
      totalOrders: revenue.ordersCount,
    },
    recentOrders,
    topProducts: topProducts.map((item) => ({
      productId: item.productId,
      productName: item.productNameSnapshot,
      unitsSold: item._sum.quantity ?? 0,
      revenue: toMoney(Number(item._sum.lineTotal ?? 0)),
    })),
  };
};

export const getAdminProducts = async (query: {
  page: number;
  pageSize: number;
  search?: string;
  categoryId?: string;
  minStock?: number;
  maxStock?: number;
  isActive?: boolean;
}) => {
  const { skip, take, page, pageSize } = normalizePagination(query);
  const [items, total] = await listAdminProductsRepo({
    skip,
    take,
    search: query.search,
    categoryId: query.categoryId,
    minStock: query.minStock,
    maxStock: query.maxStock,
    isActive: query.isActive,
  });

  return {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

export const createAdminProduct = async (
  adminUserId: string,
  payload: {
    name: string;
    slug?: string;
    description: string;
    price: number;
    stockQuantity: number;
    imageUrl: string;
    isActive: boolean;
    categoryId: string;
  },
) => {
  const category = await prisma.category.findUnique({ where: { id: payload.categoryId } });
  if (!category) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  const slug = payload.slug ? slugify(payload.slug) : slugify(payload.name);

  const product = await createProductRepo({
    name: payload.name,
    slug,
    description: payload.description,
    price: new Prisma.Decimal(payload.price),
    stockQuantity: payload.stockQuantity,
    imageUrl: payload.imageUrl,
    isActive: payload.isActive,
    category: { connect: { id: payload.categoryId } },
  });

  await Promise.all([
    invalidateProductCaches(),
    createAuditLog({
      adminUserId,
      action: 'CREATE_PRODUCT',
      entityType: 'PRODUCT',
      entityId: product.id,
      metadata: { name: product.name, slug: product.slug } as Prisma.InputJsonValue,
    }),
  ]);

  return product;
};

export const updateAdminProduct = async (
  adminUserId: string,
  productId: string,
  payload: {
    name: string;
    slug?: string;
    description: string;
    price: number;
    stockQuantity: number;
    imageUrl: string;
    isActive: boolean;
    categoryId: string;
  },
) => {
  const existing = await findProductByIdRepo(productId);
  if (!existing) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  const category = await prisma.category.findUnique({ where: { id: payload.categoryId } });
  if (!category) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  const slug = payload.slug ? slugify(payload.slug) : slugify(payload.name);

  const product = await updateProductRepo(productId, {
    name: payload.name,
    slug,
    description: payload.description,
    price: new Prisma.Decimal(payload.price),
    stockQuantity: payload.stockQuantity,
    imageUrl: payload.imageUrl,
    isActive: payload.isActive,
    category: {
      connect: {
        id: payload.categoryId,
      },
    },
  });

  await Promise.all([
    invalidateProductCaches(),
    createAuditLog({
      adminUserId,
      action: 'UPDATE_PRODUCT',
      entityType: 'PRODUCT',
      entityId: product.id,
      metadata: { name: product.name, stockQuantity: product.stockQuantity } as Prisma.InputJsonValue,
    }),
  ]);

  return product;
};

export const deleteAdminProduct = async (adminUserId: string, productId: string) => {
  const existing = await findProductByIdRepo(productId);
  if (!existing) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  await deleteProductRepo(productId);

  await Promise.all([
    invalidateProductCaches(),
    createAuditLog({
      adminUserId,
      action: 'DELETE_PRODUCT',
      entityType: 'PRODUCT',
      entityId: productId,
      metadata: { name: existing.name } as Prisma.InputJsonValue,
    }),
  ]);

  return { deleted: true };
};

export const getAdminOrders = async (query: { page: number; pageSize: number; status?: OrderStatus }) => {
  const { skip, take, page, pageSize } = normalizePagination(query);
  const [items, total] = await listAdminOrdersRepo({
    skip,
    take,
    status: query.status,
  });

  return {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

export const getAdminOrderDetails = async (id: string) => {
  const order = await findAdminOrderByIdRepo(id);
  if (!order) {
    throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  }
  return order;
};

export const updateAdminOrderStatus = async (
  adminUserId: string,
  orderId: string,
  status: OrderStatus,
) => {
  const order = await findAdminOrderByIdRepo(orderId);
  if (!order) {
    throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  const updated = await updateAdminOrderStatusRepo(orderId, status);

  await createAuditLog({
    adminUserId,
    action: 'UPDATE_ORDER_STATUS',
    entityType: 'ORDER',
    entityId: orderId,
    metadata: { from: order.status, to: status } as Prisma.InputJsonValue,
  });

  return updated;
};

export const getAdminLowStock = async (query: { threshold?: number; page: number; pageSize: number }) => {
  const threshold = query.threshold ?? env.LOW_STOCK_THRESHOLD;
  const { skip, take, page, pageSize } = normalizePagination(query);

  const [[items, total], outOfStockCount] = await Promise.all([
    getLowStockProductsRepo(threshold, skip, take),
    getOutOfStockCountRepo(),
  ]);

  return {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      threshold,
      outOfStockCount,
    },
  };
};

export const getAdminSalesAnalytics = async (days: number) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [revenueAggregate, topProducts, salesByDay] = await Promise.all([
    getRevenueAggregateRepo(),
    getTopSellingProductsRepo(10),
    getSalesByDayRepo(startDate),
  ]);

  return {
    periodDays: days,
    totalRevenue: toMoney(revenueAggregate.totalRevenue),
    totalOrders: revenueAggregate.ordersCount,
    topProducts: topProducts.map((item) => ({
      productId: item.productId,
      productName: item.productNameSnapshot,
      unitsSold: item._sum.quantity ?? 0,
      revenue: toMoney(Number(item._sum.lineTotal ?? 0)),
    })),
    salesByDay: salesByDay.map((row) => ({
      day: row.day,
      revenue: toMoney(Number(row.revenue)),
      orders: Number(row.orders),
    })),
  };
};

export const getAdminCategories = () => listCategoriesRepo();
