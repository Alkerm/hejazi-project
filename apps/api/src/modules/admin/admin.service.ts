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
  createCategoryRepo,
  createProductRepo,
  deleteProductRepo,
  findAdminOrderByIdRepo,
  findCategoryBySlugOrNameRepo,
  findProductByIdRepo,
  getBroadcastTargetUsersRepo,
  getDashboardSummaryCountsRepo,
  getLowStockProductsRepo,
  getOutOfStockCountRepo,
  getRecentOrdersRepo,
  getRevenueAggregateRepo,
  getSalesByDayRepo,
  getSalesTimelineByDayRepo,
  getSalesTimelineByMonthRepo,
  getPaymentMethodsBreakdownRepo,
  getTopCustomersByOrdersRepo,
  getTopCustomersRepo,
  getTopSellingProductsRepo,
  listAdminCustomersDirectoryRepo,
  listAdminOrdersRepo,
  listAdminAuditLogsRepo,
  listAdminProductsRepo,
  listCategoriesRepo,
  updateAdminOrderStatusRepo,
  updateProductRepo,
  getAdminFinancialProductsRepo,
  updateProductFinancialsRepo,
} from './admin.repository';

export interface AdminSalesAnalyticsQuery {
  period?: 'MONTH' | 'YEAR' | 'ALL_TIME' | 'CUSTOM' | 'DAYS';
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
  days?: number;
}

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
    arabicName?: string | null;
    slug?: string;
    description: string;
    price: number;
    costPrice?: number;
    stockQuantity: number;
    sku?: string | null;
    brand?: string | null;
    ingredients?: string | null;
    warnings?: string | null;
    usageInstructions?: string | null;
    countryOfOrigin?: string | null;
    manufacturer?: string | null;
    importerResponsible?: string | null;
    sfdaReference?: string | null;
    batchNumberRequired: boolean;
    expiryDateRequired: boolean;
    productStatus: 'DRAFT' | 'COMPLIANCE_REVIEW' | 'APPROVED' | 'INACTIVE';
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
    arabicName: payload.arabicName,
    slug,
    description: payload.description,
    price: new Prisma.Decimal(payload.price),
    costPrice: new Prisma.Decimal(payload.costPrice ?? 0),
    stockQuantity: payload.stockQuantity,
    sku: payload.sku,
    brand: payload.brand,
    ingredients: payload.ingredients,
    warnings: payload.warnings,
    usageInstructions: payload.usageInstructions,
    countryOfOrigin: payload.countryOfOrigin,
    manufacturer: payload.manufacturer,
    importerResponsible: payload.importerResponsible,
    sfdaReference: payload.sfdaReference,
    batchNumberRequired: payload.batchNumberRequired,
    expiryDateRequired: payload.expiryDateRequired,
    productStatus: payload.productStatus,
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
      metadata: {
        name: product.name,
        slug: product.slug,
        productStatus: product.productStatus,
      } as Prisma.InputJsonValue,
    }),
  ]);

  return product;
};

export const updateAdminProduct = async (
  adminUserId: string,
  productId: string,
  payload: {
    name: string;
    arabicName?: string | null;
    slug?: string;
    description: string;
    price: number;
    costPrice?: number;
    stockQuantity: number;
    sku?: string | null;
    brand?: string | null;
    ingredients?: string | null;
    warnings?: string | null;
    usageInstructions?: string | null;
    countryOfOrigin?: string | null;
    manufacturer?: string | null;
    importerResponsible?: string | null;
    sfdaReference?: string | null;
    batchNumberRequired: boolean;
    expiryDateRequired: boolean;
    productStatus: 'DRAFT' | 'COMPLIANCE_REVIEW' | 'APPROVED' | 'INACTIVE';
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
    arabicName: payload.arabicName,
    slug,
    description: payload.description,
    price: new Prisma.Decimal(payload.price),
    costPrice: payload.costPrice !== undefined ? new Prisma.Decimal(payload.costPrice) : undefined,
    stockQuantity: payload.stockQuantity,
    sku: payload.sku,
    brand: payload.brand,
    ingredients: payload.ingredients,
    warnings: payload.warnings,
    usageInstructions: payload.usageInstructions,
    countryOfOrigin: payload.countryOfOrigin,
    manufacturer: payload.manufacturer,
    importerResponsible: payload.importerResponsible,
    sfdaReference: payload.sfdaReference,
    batchNumberRequired: payload.batchNumberRequired,
    expiryDateRequired: payload.expiryDateRequired,
    productStatus: payload.productStatus,
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
      metadata: {
        name: product.name,
        stockQuantity: product.stockQuantity,
        productStatus: product.productStatus,
      } as Prisma.InputJsonValue,
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

  if (status === 'SHIPPED' && !order.driverId && !order.driverName) {
    throw new AppError(
      'A driver must be assigned to the order before setting status to Out for Delivery',
      400,
      'DRIVER_REQUIRED'
    );
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

export const updateAdminPaymentStatus = async (
  adminUserId: string,
  orderId: string,
  paymentStatus: 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED',
) => {
  const order = await findAdminOrderByIdRepo(orderId);
  if (!order) {
    throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus },
  });

  await prisma.paymentTransaction.create({
    data: {
      orderId,
      gateway: order.paymentMethod || 'COD',
      amount: order.total,
      status: paymentStatus,
      rawResponse: { updatedByAdmin: adminUserId },
    },
  });

  await createAuditLog({
    adminUserId,
    action: 'UPDATE_PAYMENT_STATUS',
    entityType: 'ORDER',
    entityId: orderId,
    metadata: { from: order.paymentStatus, to: paymentStatus } as Prisma.InputJsonValue,
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

export const getAdminSalesAnalytics = async (params: AdminSalesAnalyticsQuery = {}) => {
  const period = params.period || (params.days ? 'DAYS' : 'MONTH');
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  let startDate: Date | undefined;
  let endDate: Date | undefined;
  let prevStartDate: Date | undefined;
  let prevEndDate: Date | undefined;
  let groupBy: 'DAY' | 'MONTH' = 'DAY';
  let targetYear = params.year ?? currentYear;
  let targetMonth = params.month ?? currentMonth;
  let labelEn = '';
  let labelAr = '';

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  if (period === 'MONTH') {
    targetYear = params.year ?? currentYear;
    targetMonth = params.month ?? currentMonth;
    if (targetMonth < 1 || targetMonth > 12) targetMonth = currentMonth;

    startDate = new Date(Date.UTC(targetYear, targetMonth - 1, 1, 0, 0, 0, 0));
    endDate = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59, 999));
    groupBy = 'DAY';

    const prevYear = targetMonth === 1 ? targetYear - 1 : targetYear;
    const prevMonth = targetMonth === 1 ? 12 : targetMonth - 1;
    prevStartDate = new Date(Date.UTC(prevYear, prevMonth - 1, 1, 0, 0, 0, 0));
    prevEndDate = new Date(Date.UTC(prevYear, prevMonth, 0, 23, 59, 59, 999));

    labelEn = `${monthNamesEn[targetMonth - 1]} ${targetYear}`;
    labelAr = `${monthNamesAr[targetMonth - 1]} ${targetYear}`;
  } else if (period === 'YEAR') {
    targetYear = params.year ?? currentYear;
    startDate = new Date(Date.UTC(targetYear, 0, 1, 0, 0, 0, 0));
    endDate = new Date(Date.UTC(targetYear, 11, 31, 23, 59, 59, 999));
    groupBy = 'MONTH';

    prevStartDate = new Date(Date.UTC(targetYear - 1, 0, 1, 0, 0, 0, 0));
    prevEndDate = new Date(Date.UTC(targetYear - 1, 11, 31, 23, 59, 59, 999));

    labelEn = `Year ${targetYear}`;
    labelAr = `عام ${targetYear}`;
  } else if (period === 'ALL_TIME') {
    startDate = undefined;
    endDate = new Date();
    groupBy = 'MONTH';

    labelEn = 'All Time (Store Inception to Present)';
    labelAr = 'منذ انطلاق المتجر حتى اليوم';
  } else if (period === 'CUSTOM') {
    if (params.startDate) {
      startDate = new Date(params.startDate);
      startDate.setHours(0, 0, 0, 0);
    }
    if (params.endDate) {
      endDate = new Date(params.endDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      endDate = new Date();
    }
    const diffDays = startDate && endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 90;
    groupBy = diffDays <= 62 ? 'DAY' : 'MONTH';

    labelEn = `Custom Period (${params.startDate || 'Start'} to ${params.endDate || 'Now'})`;
    labelAr = `فترة مخصصة (${params.startDate || 'البداية'} إلى ${params.endDate || 'الآن'})`;
  } else {
    // DAYS
    const days = params.days ?? 30;
    endDate = new Date();
    startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    groupBy = 'DAY';

    labelEn = `Last ${days} Days`;
    labelAr = `آخر ${days} يوماً`;
  }

  const [revenueAggregate, topProducts, topCustomers, timelineRaw, paymentMethods, prevRevenueAggregate] =
    await Promise.all([
      getRevenueAggregateRepo(startDate, endDate),
      getTopSellingProductsRepo(10, startDate, endDate),
      getTopCustomersRepo(startDate, 10, endDate),
      groupBy === 'DAY'
        ? getSalesTimelineByDayRepo(startDate, endDate)
        : getSalesTimelineByMonthRepo(startDate, endDate),
      getPaymentMethodsBreakdownRepo(startDate, endDate),
      prevStartDate && prevEndDate ? getRevenueAggregateRepo(prevStartDate, prevEndDate) : Promise.resolve(null),
    ]);

  let growthRate: number | null = null;
  if (prevRevenueAggregate && prevRevenueAggregate.totalRevenue > 0) {
    growthRate = Number(
      (((revenueAggregate.totalRevenue - prevRevenueAggregate.totalRevenue) / prevRevenueAggregate.totalRevenue) * 100).toFixed(1)
    );
  } else if (prevRevenueAggregate && prevRevenueAggregate.totalRevenue === 0 && revenueAggregate.totalRevenue > 0) {
    growthRate = 100;
  }

  const totalRev = Number(revenueAggregate.totalRevenue);
  const totalOrders = Number(revenueAggregate.ordersCount);
  const aov = totalOrders > 0 ? toMoney(totalRev / totalOrders) : 0;

  const timeline = timelineRaw.map((row) => ({
    period: row.period,
    revenue: toMoney(Number(row.revenue)),
    orders: Number(row.orders),
  }));

  return {
    periodType: period,
    periodLabel: {
      en: labelEn,
      ar: labelAr,
    },
    selectedYear: targetYear,
    selectedMonth: targetMonth,
    startDate: startDate?.toISOString() ?? null,
    endDate: endDate?.toISOString() ?? null,
    totalRevenue: toMoney(totalRev),
    totalOrders,
    totalUnitsSold: revenueAggregate.totalUnitsSold,
    averageOrderValue: aov,
    previousPeriodRevenue: prevRevenueAggregate ? toMoney(prevRevenueAggregate.totalRevenue) : null,
    growthRate,
    topProducts: topProducts.map((item) => ({
      productId: item.productId,
      productName: item.productNameSnapshot,
      unitsSold: item._sum.quantity ?? 0,
      revenue: toMoney(Number(item._sum.lineTotal ?? 0)),
    })),
    topCustomers: topCustomers.map((item) => ({
      userId: item.userId,
      customerName: item.customer
        ? `${item.customer.firstName} ${item.customer.lastName}`.trim()
        : 'Unknown Customer',
      email: item.customer?.email ?? null,
      ordersCount: item.ordersCount,
      totalSpent: toMoney(item.totalSpent),
    })),
    paymentMethods: paymentMethods.map((pm) => ({
      method: pm.method,
      label: pm.label,
      revenue: toMoney(pm.revenue),
      ordersCount: pm.ordersCount,
      percentage: totalRev > 0 ? Number(((pm.revenue / totalRev) * 100).toFixed(1)) : 0,
    })),
    timeline,
    // Backward compatibility fields
    periodDays: params.days ?? 30,
    salesByDay: timeline.map((row) => ({
      day: row.period,
      revenue: row.revenue,
      orders: row.orders,
    })),
  };
};

export const getAdminCategories = () => listCategoriesRepo();

export const createAdminCategory = async (
  adminUserId: string,
  payload: {
    name: string;
    arabicName?: string | null;
    slug?: string;
  },
) => {
  const generatedSlug = (payload.slug?.trim() || slugify(payload.name)).toLowerCase();

  const existing = await findCategoryBySlugOrNameRepo(generatedSlug, payload.name.trim());
  if (existing) {
    throw new AppError('Category with this name or slug already exists', 409, 'CATEGORY_EXISTS');
  }

  const category = await createCategoryRepo({
    name: payload.name.trim(),
    slug: generatedSlug,
  });

  await createAuditLog({
    adminUserId,
    action: 'CREATE_CATEGORY',
    entityType: 'CATEGORY',
    entityId: category.id,
    metadata: { name: payload.name, arabicName: payload.arabicName, slug: generatedSlug },
  });

  return {
    ...category,
    arabicName: payload.arabicName ?? null,
  };
};

export const getAdminProductDetails = async (productId: string) => {
  const product = await findProductByIdRepo(productId);
  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  return product;
};

export const getAdminAuditLogs = async (query: { page: number; pageSize: number }) => {
  const { skip, take, page, pageSize } = normalizePagination(query);
  const [items, total] = await listAdminAuditLogsRepo(skip, take);

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

export const getAdminCustomersOverview = async (query: {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: 'spending' | 'orders' | 'newest' | 'name';
  role?: 'USER' | 'ADMIN' | 'DRIVER';
  marketingOnly?: boolean;
}) => {
  const { skip, take, page, pageSize } = normalizePagination(query);

  const [topBySpending, topByOrders, { users, total }, totalCustomersCount, marketingCount, revenueAgg] =
    await Promise.all([
      getTopCustomersRepo(new Date(0), 10),
      getTopCustomersByOrdersRepo(10),
      listAdminCustomersDirectoryRepo({
        skip,
        take,
        search: query.search,
        role: query.role,
        marketingOnly: query.marketingOnly,
      }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { marketingConsent: true } }),
      getRevenueAggregateRepo(),
    ]);

  const formattedDirectory = (users || []).map((u) => {
    const totalSpent = (u.orders || []).reduce((sum, ord) => sum + Number(ord.total || 0), 0);
    const ordersCount = (u.orders || []).length;
    const defaultAddr = u.addresses?.[0];

    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      marketingConsent: Boolean(u.marketingConsent),
      createdAt: u.createdAt,
      totalOrders: ordersCount,
      totalSpent: toMoney(totalSpent),
      city: defaultAddr?.city || null,
      country: defaultAddr?.country || null,
      addressSummary: defaultAddr ? `${defaultAddr.city}, ${defaultAddr.line1}` : null,
    };
  });

  const totalOrders = revenueAgg.ordersCount || 0;
  const totalRevenue = revenueAgg.totalRevenue || 0;
  const avgOrderValue = totalOrders > 0 ? toMoney(totalRevenue / totalOrders) : 0;

  const repeatCount = await prisma.user.count({
    where: {
      orders: {
        some: {},
      },
    },
  });

  return {
    metrics: {
      totalCustomers: totalCustomersCount,
      totalOrders,
      totalRevenue: toMoney(totalRevenue),
      averageOrderValue: avgOrderValue,
      marketingConsentedCount: marketingCount,
      activeBuyersCount: repeatCount,
    },
    topBySpending: topBySpending.map((t) => ({
      userId: t.userId,
      customerName: t.customer ? `${t.customer.firstName} ${t.customer.lastName}`.trim() : 'Customer',
      email: t.customer?.email || 'N/A',
      totalSpent: toMoney(t.totalSpent),
      ordersCount: t.ordersCount,
    })),
    topByOrders: topByOrders.map((t) => ({
      userId: t.userId,
      customerName: t.customer ? `${t.customer.firstName} ${t.customer.lastName}`.trim() : 'Customer',
      email: t.customer?.email || 'N/A',
      phone: t.customer?.phone || null,
      totalSpent: toMoney(t.totalSpent),
      ordersCount: t.ordersCount,
      city: t.customer?.addresses?.[0]?.city || null,
    })),
    directory: {
      items: formattedDirectory,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    },
  };
};

export const sendAdminAnnouncementBroadcast = async (
  adminUserId: string,
  payload: {
    audience: 'ALL' | 'MARKETING_ONLY' | 'VIP_ONLY';
    subject: string;
    title: string;
    message: string;
    callToActionUrl?: string;
    callToActionLabel?: string;
  },
) => {
  const recipients = await getBroadcastTargetUsersRepo(payload.audience);

  await createAuditLog({
    adminUserId,
    action: 'BROADCAST_EMAIL_SENT',
    entityType: 'ANNOUNCEMENT',
    metadata: {
      audience: payload.audience,
      subject: payload.subject,
      title: payload.title,
      recipientCount: recipients.length,
      sampleRecipients: recipients.slice(0, 5).map((r) => r.email),
    },
  });

  return {
    success: true,
    recipientCount: recipients.length,
    audience: payload.audience,
    subject: payload.subject,
    title: payload.title,
    sentAt: new Date().toISOString(),
    sampleRecipients: recipients.slice(0, 5).map((r) => r.email),
  };
};

export const getAdminFinancialOverview = async (query: {
  search?: string;
  categoryId?: string;
  sortBy?: 'profit' | 'margin' | 'revenue' | 'stock' | 'cost' | 'price' | 'name';
}) => {
  const [products, paidOrders] = await Promise.all([
    getAdminFinancialProductsRepo({
      search: query.search,
      categoryId: query.categoryId,
    }),
    prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        status: { not: 'CANCELLED' },
      },
      select: {
        id: true,
        subtotal: true,
        total: true,
        status: true,
        paymentStatus: true,
        items: {
          select: {
            productId: true,
            quantity: true,
            unitPriceSnapshot: true,
            costPriceSnapshot: true,
            lineTotal: true,
            product: {
              select: {
                costPrice: true,
              },
            },
          },
        },
      },
    }),
  ]);

  let totalRevenue = 0;
  let totalCostOfGoodsSold = 0;
  let totalUnitsSoldAll = 0;

  for (const order of paidOrders) {
    totalRevenue += Number(order.subtotal);
    for (const item of order.items) {
      totalUnitsSoldAll += item.quantity;
      const productCost = Number(item.product?.costPrice || 0);
      const unitCost = Number(item.costPriceSnapshot || 0) > 0 ? Number(item.costPriceSnapshot) : productCost;
      totalCostOfGoodsSold += unitCost * item.quantity;
    }
  }

  const netRealizedProfit = totalRevenue - totalCostOfGoodsSold;
  const overallMarginPercentage = totalRevenue > 0 ? (netRealizedProfit / totalRevenue) * 100 : 0;

  let inventoryTotalCostValue = 0;
  let inventoryTotalRetailValue = 0;
  let totalInStockUnits = 0;

  const productFinancialItems = products.map((p) => {
    const price = Number(p.price);
    const costPrice = Number(p.costPrice || 0);
    const unitProfit = price - costPrice;
    const marginPercentage = price > 0 ? (unitProfit / price) * 100 : 0;
    const stockQuantity = p.stockQuantity;

    const stockCostValue = stockQuantity * costPrice;
    const stockRetailValue = stockQuantity * price;
    const stockPotentialProfit = stockQuantity * unitProfit;

    inventoryTotalCostValue += stockCostValue;
    inventoryTotalRetailValue += stockRetailValue;
    totalInStockUnits += stockQuantity;

    let unitsSold = 0;
    let realizedRevenue = 0;
    let realizedCost = 0;

    for (const oi of p.orderItems) {
      if (oi.order?.paymentStatus === 'PAID' && oi.order?.status !== 'CANCELLED') {
        unitsSold += oi.quantity;
        realizedRevenue += Number(oi.lineTotal);
        const itemCost = Number(oi.costPriceSnapshot || 0) > 0 ? Number(oi.costPriceSnapshot) : costPrice;
        realizedCost += itemCost * oi.quantity;
      }
    }

    const realizedProfit = realizedRevenue - realizedCost;

    return {
      id: p.id,
      name: p.name,
      arabicName: p.arabicName,
      slug: p.slug,
      sku: p.sku,
      imageUrl: p.imageUrl,
      isActive: p.isActive,
      category: p.category,
      price,
      costPrice,
      unitProfit,
      marginPercentage: Math.round(marginPercentage * 10) / 10,
      stockQuantity,
      stockCostValue,
      stockRetailValue,
      stockPotentialProfit,
      unitsSold,
      realizedRevenue,
      realizedProfit,
    };
  });

  if (query.sortBy === 'margin') {
    productFinancialItems.sort((a, b) => b.marginPercentage - a.marginPercentage);
  } else if (query.sortBy === 'revenue') {
    productFinancialItems.sort((a, b) => b.realizedRevenue - a.realizedRevenue);
  } else if (query.sortBy === 'stock') {
    productFinancialItems.sort((a, b) => b.stockQuantity - a.stockQuantity);
  } else if (query.sortBy === 'cost') {
    productFinancialItems.sort((a, b) => b.costPrice - a.costPrice);
  } else if (query.sortBy === 'price') {
    productFinancialItems.sort((a, b) => b.price - a.price);
  } else if (query.sortBy === 'name') {
    productFinancialItems.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    productFinancialItems.sort((a, b) => b.unitProfit - a.unitProfit);
  }

  const expectedInventoryProfit = inventoryTotalRetailValue - inventoryTotalCostValue;

  return {
    metrics: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCostOfGoodsSold: Math.round(totalCostOfGoodsSold * 100) / 100,
      netRealizedProfit: Math.round(netRealizedProfit * 100) / 100,
      overallMarginPercentage: Math.round(overallMarginPercentage * 10) / 10,
      inventoryTotalCostValue: Math.round(inventoryTotalCostValue * 100) / 100,
      inventoryTotalRetailValue: Math.round(inventoryTotalRetailValue * 100) / 100,
      expectedInventoryProfit: Math.round(expectedInventoryProfit * 100) / 100,
      totalOrdersCount: paidOrders.length,
      totalUnitsSoldAll,
      totalInStockUnits,
      activeProductsCount: products.filter((p) => p.isActive).length,
    },
    products: productFinancialItems,
  };
};

export const updateAdminProductFinancials = async (
  adminUserId: string,
  productId: string,
  payload: { costPrice?: number; price?: number }
) => {
  const existing = await findProductByIdRepo(productId);
  if (!existing) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  const updated = await updateProductFinancialsRepo(productId, payload);

  await Promise.all([
    invalidateProductCaches(),
    createAuditLog({
      adminUserId,
      action: 'UPDATE_PRODUCT_FINANCIALS',
      entityType: 'PRODUCT',
      entityId: productId,
      metadata: {
        previousCost: Number(existing.costPrice || 0),
        previousPrice: Number(existing.price),
        newCost: payload.costPrice !== undefined ? payload.costPrice : Number(existing.costPrice || 0),
        newPrice: payload.price !== undefined ? payload.price : Number(existing.price),
      } as Prisma.InputJsonValue,
    }),
  ]);

  const price = Number(updated.price);
  const costPrice = Number(updated.costPrice || 0);
  const unitProfit = price - costPrice;
  const marginPercentage = price > 0 ? (unitProfit / price) * 100 : 0;

  return {
    id: updated.id,
    name: updated.name,
    arabicName: updated.arabicName,
    price,
    costPrice,
    unitProfit,
    marginPercentage: Math.round(marginPercentage * 10) / 10,
    stockQuantity: updated.stockQuantity,
  };
};

export const adjustAdminProductStock = async (
  adminUserId: string,
  productId: string,
  payload: {
    quantityToAdd: number;
    costPrice?: number;
    note?: string;
  },
) => {
  const product = await findProductByIdRepo(productId);
  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  const previousStock = product.stockQuantity;
  const newStock = previousStock + payload.quantityToAdd;

  const updateData: Prisma.ProductUpdateInput = {
    stockQuantity: newStock,
  };

  if (payload.costPrice !== undefined && payload.costPrice >= 0) {
    updateData.costPrice = new Prisma.Decimal(payload.costPrice);
  }

  const updated = await updateProductRepo(productId, updateData);

  await Promise.all([
    invalidateProductCaches(),
    createAuditLog({
      adminUserId,
      action: 'RESTOCK_PRODUCT',
      entityType: 'PRODUCT',
      entityId: productId,
      metadata: {
        productName: product.name,
        previousStock,
        quantityAdded: payload.quantityToAdd,
        newStock,
        costPrice: payload.costPrice,
        note: payload.note,
      } as Prisma.InputJsonValue,
    }),
  ]);

  return {
    product: updated,
    previousStock,
    quantityAdded: payload.quantityToAdd,
    newStock,
  };
};

