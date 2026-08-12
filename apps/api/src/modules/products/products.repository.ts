import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client';

const sortMap: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: 'desc' },
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
  name_asc: { name: 'asc' },
};

export const listProducts = async (input: {
  search?: string;
  category?: string;
  sort: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
  skip: number;
  take: number;
}) => {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(input.search
      ? {
          name: {
            contains: input.search,
            mode: 'insensitive',
          },
        }
      : {}),
    ...(input.category
      ? {
          category: {
            slug: input.category,
          },
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: sortMap[input.sort],
      skip: input.skip,
      take: input.take,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total };
};

export const findProductByIdOrSlug = (idOrSlug: string) =>
  prisma.product.findFirst({
    where: {
      isActive: true,
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      category: true,
    },
  });

export const listCategories = () =>
  prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });
