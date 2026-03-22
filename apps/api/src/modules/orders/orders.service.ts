import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { AppError } from '../../utils/app-error';
import { toMoney } from '../../utils/money';
import { normalizePagination } from '../../utils/pagination';
import { findOrderByUser, getCartWithItems, listOrdersByUser } from './orders.repository';

export const createOrderFromCart = async (
  userId: string,
  payload: {
    shippingAddress: {
      line1: string;
      line2?: string | null;
      city: string;
      country: string;
      postalCode: string;
    };
    currency?: string;
  },
) => {
  const cart = await getCartWithItems(userId);
  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400, 'CART_EMPTY');
  }

  const order = await prisma.$transaction(
    async (tx) => {
      let subtotal = 0;

      const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

      for (const item of cart.items) {
        if (!item.product.isActive) {
          throw new AppError(`Product ${item.product.name} is inactive`, 400, 'PRODUCT_INACTIVE');
        }

        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            stockQuantity: {
              gte: item.quantity,
            },
          },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });

        if (stockUpdate.count !== 1) {
          throw new AppError(`Insufficient stock for ${item.product.name}`, 409, 'INSUFFICIENT_STOCK');
        }

        const unitPrice = Number(item.product.price);
        const lineTotal = toMoney(unitPrice * item.quantity);
        subtotal += lineTotal;

        orderItemsData.push({
          productId: item.productId,
          productNameSnapshot: item.product.name,
          unitPriceSnapshot: new Prisma.Decimal(unitPrice),
          quantity: item.quantity,
          lineTotal: new Prisma.Decimal(lineTotal),
        });
      }

      const subtotalRounded = toMoney(subtotal);
      const total = subtotalRounded;

      const created = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          subtotal: new Prisma.Decimal(subtotalRounded),
          total: new Prisma.Decimal(total),
          currency: payload.currency ?? 'SAR',
          shippingAddressSnapshot: payload.shippingAddress,
          items: {
            createMany: {
              data: orderItemsData,
            },
          },
        },
        include: {
          items: true,
        },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    },
    {
      isolationLevel: 'Serializable',
    },
  );

  return order;
};

export const getMyOrders = async (userId: string, query: { page: number; pageSize: number }) => {
  const { skip, take, page, pageSize } = normalizePagination(query);
  const [items, total] = await listOrdersByUser(userId, skip, take);

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

export const getMyOrderDetails = async (userId: string, orderId: string) => {
  const order = await findOrderByUser(userId, orderId);
  if (!order) {
    throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  return order;
};
