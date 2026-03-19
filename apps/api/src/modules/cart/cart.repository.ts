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
  const existing = await prisma.cart.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.cart.create({ data: { userId } });
};

export const getCartItem = (itemId: string) => prisma.cartItem.findUnique({ where: { id: itemId } });
