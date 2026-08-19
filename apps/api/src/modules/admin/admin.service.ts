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

export const getAdminSalesAnalytics = async (days: number) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [revenueAggregate, topProducts, topCustomers, salesByDay] = await Promise.all([
    getRevenueAggregateRepo(startDate),
    getTopSellingProductsRepo(10, startDate),
    getTopCustomersRepo(startDate, 10),
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
    topCustomers: topCustomers.map((item) => ({
      userId: item.userId,
      customerName: item.customer
        ? `${item.customer.firstName} ${item.customer.lastName}`.trim()
        : 'Unknown Customer',
      email: item.customer?.email ?? null,
      ordersCount: item.ordersCount,
      totalSpent: toMoney(item.totalSpent),
    })),
    salesByDay: salesByDay.map((row) => ({
      day: row.day,
      revenue: toMoney(Number(row.revenue)),
      orders: Number(row.orders),
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
      getTopCustomersRepo(10),
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

  const formattedDirectory = users.map((u) => {
    const totalSpent = u.orders.reduce((sum, ord) => sum + Number(ord.total), 0);
    const ordersCount = u.orders.length;
    const defaultAddr = u.addresses[0];

    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      marketingConsent: u.marketingConsent,
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
  const [products, activeOrders] = await Promise.all([
    getAdminFinancialProductsRepo({
      search: query.search,
      categoryId: query.categoryId,
    }),
    prisma.order.findMany({
      where: {
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

  for (const order of activeOrders) {
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
      unitsSold += oi.quantity;
      realizedRevenue += Number(oi.lineTotal);
      const itemCost = Number(oi.costPriceSnapshot || 0) > 0 ? Number(oi.costPriceSnapshot) : costPrice;
      realizedCost += itemCost * oi.quantity;
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
      totalOrdersCount: activeOrders.length,
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
