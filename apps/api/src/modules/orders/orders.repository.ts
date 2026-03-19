import { prisma } from '../../prisma/client';

export const getCartWithItems = (userId: string) =>
  prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

export const listOrdersByUser = (userId: string, skip: number, take: number) =>
  prisma.$transaction([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        items: true,
      },
    }),
    prisma.order.count({ where: { userId } }),
  ]);

export const findOrderByUser = (userId: string, id: string) =>
  prisma.order.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      items: true,
    },
  });
