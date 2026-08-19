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
  minStock?: number;
  maxStock?: number;
  isActive?: boolean;
}) => {
  const stockQuantity: Prisma.IntFilter | undefined =
    input.minStock !== undefined || input.maxStock !== undefined
      ? {
          ...(input.minStock !== undefined ? { gte: input.minStock } : {}),
          ...(input.maxStock !== undefined ? { lte: input.maxStock } : {}),
        }
      : undefined;

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
    ...(stockQuantity ? { stockQuantity } : {}),
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

export const findProductByIdRepo = (id: string) =>
  prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

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

export const getTopSellingProductsRepo = (take = 5, startDate?: Date) =>
  prisma.orderItem.groupBy({
    by: ['productId', 'productNameSnapshot'],
    where: startDate
      ? {
          order: {
            createdAt: { gte: startDate },
          },
        }
      : undefined,
    _sum: { quantity: true, lineTotal: true },
    orderBy: {
      _sum: {
        quantity: 'desc',
      },
    },
    take,
  });

export const getRevenueAggregateRepo = async (startDate?: Date) => {
  const where: Prisma.OrderWhereInput = {
    ...(startDate ? { createdAt: { gte: startDate } } : {}),
  };
  const [ordersCount, salesAggregate] = await prisma.$transaction([
    prisma.order.count({
      where: {
        ...where,
        paymentStatus: { in: ['UNPAID', 'PENDING', 'PAID'] },
      },
    }),
    prisma.order.aggregate({
      where,
      _sum: { total: true },
      _count: { _all: true },
    }),
  ]);

  return {
    ordersCount: ordersCount ?? 0,
    totalRevenue: Number(salesAggregate?._sum?.total ?? 0),
  };
};

export const getTopCustomersRepo = async (startDate: Date = new Date(0), take = 5) => {
  const grouped = await prisma.order.groupBy({
    by: ['userId'],
    where: {
      createdAt: { gte: startDate },
    },
    _sum: { total: true },
    _count: { id: true },
    orderBy: {
      _sum: {
        total: 'desc',
      },
    },
    take,
  });

  if (grouped.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((row) => row.userId) } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  const usersById = new Map(users.map((user) => [user.id, user]));

  return grouped.map((row) => ({
    userId: row.userId,
    customer: usersById.get(row.userId),
    totalSpent: Number(row._sum.total ?? 0),
    ordersCount: row._count.id,
  }));
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

export const findCategoryBySlugOrNameRepo = (slug: string, name: string) =>
  prisma.category.findFirst({
    where: {
      OR: [{ slug }, { name }],
    },
  });

export const createCategoryRepo = (data: { name: string; slug: string }) =>
  prisma.category.create({ data });

export const listAdminAuditLogsRepo = (skip: number, take: number) =>
  prisma.$transaction([
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        adminUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    prisma.adminAuditLog.count(),
  ]);

export const getTopCustomersByOrdersRepo = async (take: number) => {
  const grouped = await prisma.order.groupBy({
    by: ['userId'],
    _sum: { total: true },
    _count: { id: true },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take,
  });

  if (grouped.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((row) => row.userId) } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      createdAt: true,
      addresses: {
        where: { isDefault: true },
        take: 1,
      },
    },
  });

  const usersById = new Map(users.map((user) => [user.id, user]));

  return grouped.map((row) => ({
    userId: row.userId,
    customer: usersById.get(row.userId),
    totalSpent: Number(row._sum.total ?? 0),
    ordersCount: row._count.id,
  }));
};

export const listAdminCustomersDirectoryRepo = async (input: {
  skip: number;
  take: number;
  search?: string;
  role?: 'USER' | 'ADMIN' | 'DRIVER';
  marketingOnly?: boolean;
}) => {
  const where: Prisma.UserWhereInput = {
    ...(input.role ? { role: input.role } : { role: 'USER' }),
    ...(input.marketingOnly ? { marketingConsent: true } : {}),
    ...(input.search
      ? {
          OR: [
            { firstName: { contains: input.search, mode: 'insensitive' } },
            { lastName: { contains: input.search, mode: 'insensitive' } },
            { email: { contains: input.search, mode: 'insensitive' } },
            { phone: { contains: input.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        marketingConsent: true,
        createdAt: true,
        addresses: {
          where: { isDefault: true },
          take: 1,
          select: {
            city: true,
            country: true,
            line1: true,
          },
        },
        orders: {
          select: {
            id: true,
            total: true,
            paymentStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: input.skip,
      take: input.take,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
};

export const getBroadcastTargetUsersRepo = async (audience: 'ALL' | 'MARKETING_ONLY' | 'VIP_ONLY') => {
  const where: Prisma.UserWhereInput = {
    ...(audience === 'MARKETING_ONLY' ? { marketingConsent: true } : {}),
    ...(audience === 'VIP_ONLY' ? { orders: { some: {} } } : {}),
  };

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      marketingConsent: true,
    },
  });
};

export const getAdminFinancialProductsRepo = async (filters: {
  search?: string;
  categoryId?: string;
}) => {
  const where: Prisma.ProductWhereInput = {
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { arabicName: { contains: filters.search, mode: 'insensitive' } },
            { sku: { contains: filters.search, mode: 'insensitive' } },
            { id: { contains: filters.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  return prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      arabicName: true,
      slug: true,
      sku: true,
      price: true,
      costPrice: true,
      stockQuantity: true,
      imageUrl: true,
      isActive: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      orderItems: {
        where: {
          order: {
            status: { not: 'CANCELLED' },
          },
        },
        select: {
          quantity: true,
          unitPriceSnapshot: true,
          costPriceSnapshot: true,
          lineTotal: true,
          order: {
            select: {
              paymentStatus: true,
              status: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateProductFinancialsRepo = (
  id: string,
  data: { costPrice?: number; price?: number }
) => {
  const updateData: Prisma.ProductUpdateInput = {};
  if (data.costPrice !== undefined) {
    updateData.costPrice = new Prisma.Decimal(data.costPrice);
  }
  if (data.price !== undefined) {
    updateData.price = new Prisma.Decimal(data.price);
  }

  return prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
    },
  });
};
