import { prisma } from '../../prisma/client';

export const getCartByUserId = (userId: string) =>
  prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { category: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

export const ensureCart = async (userId: string) => {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
};

export const getCartItem = (itemId: string) => prisma.cartItem.findUnique({ where: { id: itemId } });
