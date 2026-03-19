import { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client';

export const createAuditLog = (payload: {
  adminUserId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
}) =>
  prisma.adminAuditLog.create({
    data: {
      adminUserId: payload.adminUserId,
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId,
      metadata: payload.metadata,
    },
  });

export const listAdminProductsRepo = (input: {
  skip: number;
  take: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}) => {
  const where: Prisma.ProductWhereInput = {
    ...(input.search
      ? {
          name: {
            contains: input.search,
            mode: 'insensitive',
          },
        }
      : {}),
    ...(input.categoryId ? { categoryId: input.categoryId } : {}),
    ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
  };

  return prisma.$transaction([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip: input.skip,
      take: input.take,
    }),
    prisma.product.count({ where }),
  ]);
};

export const createProductRepo = (data: Prisma.ProductCreateInput) =>
  prisma.product.create({
    data,
    include: { category: true },
  });

export const updateProductRepo = (id: string, data: Prisma.ProductUpdateInput) =>
  prisma.product.update({
    where: { id },
    data,
    include: { category: true },
  });

export const deleteProductRepo = (id: string) => prisma.product.delete({ where: { id } });

export const findProductByIdRepo = (id: string) => prisma.product.findUnique({ where: { id } });

export const listAdminOrdersRepo = (input: { skip: number; take: number; status?: OrderStatus }) => {
  const where: Prisma.OrderWhereInput = input.status ? { status: input.status } : {};

  return prisma.$transaction([
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: input.skip,
      take: input.take,
    }),
    prisma.order.count({ where }),
  ]);
};

export const findAdminOrderByIdRepo = (id: string) =>
  prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      items: true,
    },
  });

export const updateAdminOrderStatusRepo = (id: string, status: OrderStatus) =>
  prisma.order.update({ where: { id }, data: { status } });

export const getRecentOrdersRepo = (limit = 8) =>
  prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  });

export const getLowStockProductsRepo = (threshold: number, skip: number, take: number) => {
  const where: Prisma.ProductWhereInput = {
    stockQuantity: { lte: threshold },
    isActive: true,
  };

  return prisma.$transaction([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { stockQuantity: 'asc' },
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);
};

export const getOutOfStockCountRepo = () =>
  prisma.product.count({ where: { stockQuantity: 0, isActive: true } });

export const getTopSellingProductsRepo = (take = 5) =>
  prisma.orderItem.groupBy({
    by: ['productId', 'productNameSnapshot'],
    _sum: { quantity: true, lineTotal: true },
    orderBy: {
      _sum: {
        quantity: 'desc',
      },
    },
    take,
  });

export const getRevenueAggregateRepo = async () => {
  const [ordersCount, salesAggregate] = await prisma.$transaction([
    prisma.order.count({ where: { paymentStatus: { in: ['UNPAID', 'PENDING', 'PAID'] } } }),
    prisma.order.aggregate({
      _sum: { total: true },
      _count: { _all: true },
    }),
  ]);

  return {
    ordersCount,
    totalRevenue: Number(salesAggregate._sum.total ?? 0),
  };
};

export const getSalesByDayRepo = (startDate: Date) =>
  prisma.$queryRaw<Array<{ day: string; revenue: Prisma.Decimal; orders: bigint }>>`
    SELECT
      TO_CHAR(DATE_TRUNC('day', "createdAt"), 'YYYY-MM-DD') AS day,
      COALESCE(SUM("total"), 0) AS revenue,
      COUNT(*)::bigint AS orders
    FROM "Order"
    WHERE "createdAt" >= ${startDate}
    GROUP BY DATE_TRUNC('day', "createdAt")
    ORDER BY DATE_TRUNC('day', "createdAt") ASC
  `;

export const getDashboardSummaryCountsRepo = async (lowStockThreshold: number) => {
  const [productsCount, lowStockCount, pendingOrdersCount, usersCount] = await prisma.$transaction([
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true, stockQuantity: { lte: lowStockThreshold } } }),
    prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } } }),
    prisma.user.count({ where: { role: 'USER' } }),
  ]);

  return { productsCount, lowStockCount, pendingOrdersCount, usersCount };
};

export const listCategoriesRepo = () => prisma.category.findMany({ orderBy: { name: 'asc' } });
