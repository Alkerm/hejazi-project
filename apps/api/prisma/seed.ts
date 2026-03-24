import { PrismaClient, ProductStatus, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Passw0rd!123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cosmetics.local' },
    update: {
      firstName: 'Store',
      lastName: 'Admin',
      passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      firstName: 'Store',
      lastName: 'Admin',
      email: 'admin@cosmetics.local',
      passwordHash,
      role: UserRole.ADMIN,
      phone: '+15550000001',
      cart: { create: {} },
      addresses: {
        create: {
          line1: '11 Admin Plaza',
          city: 'New York',
          country: 'USA',
          postalCode: '10001',
          isDefault: true,
        },
      },
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@cosmetics.local' },
    update: {
      firstName: 'Maya',
      lastName: 'Johnson',
      passwordHash,
      role: UserRole.USER,
    },
    create: {
      firstName: 'Maya',
      lastName: 'Johnson',
      email: 'customer@cosmetics.local',
      passwordHash,
      role: UserRole.USER,
      phone: '+15550000002',
      cart: { create: {} },
      addresses: {
        create: {
          line1: '24 Bloom Street',
          city: 'Los Angeles',
          country: 'USA',
          postalCode: '90001',
          isDefault: true,
        },
      },
    },
  });

  const categoriesData = [
    { name: 'Skincare', slug: 'skincare' },
    { name: 'Makeup', slug: 'makeup' },
    { name: 'Haircare', slug: 'haircare' },
    { name: 'Fragrance', slug: 'fragrance' },
  ];

  for (const category of categoriesData) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  const categories = await prisma.category.findMany();
  const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  const products = [
    {
      name: 'Radiance Vitamin C Serum',
      slug: 'radiance-vitamin-c-serum',
      description: 'Brightening serum with 15% vitamin C and hyaluronic acid.',
      price: 34.99,
      stockQuantity: 120,
      imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883',
      categoryId: bySlug.skincare,
    },
    {
      name: 'Hydra Calm Moisturizer',
      slug: 'hydra-calm-moisturizer',
      description: 'Lightweight daily moisturizer for sensitive skin.',
      price: 26.5,
      stockQuantity: 90,
      imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b',
      categoryId: bySlug.skincare,
    },
    {
      name: 'Velvet Matte Lipstick',
      slug: 'velvet-matte-lipstick',
      description: 'Long-lasting matte finish with rich pigment.',
      price: 18.75,
      stockQuantity: 150,
      imageUrl: 'https://images.unsplash.com/photo-1631214524020-58c5ae47fd4f',
      categoryId: bySlug.makeup,
    },
    {
      name: 'Lash Lift Mascara',
      slug: 'lash-lift-mascara',
      description: 'Smudge-proof volume mascara with keratin blend.',
      price: 21,
      stockQuantity: 80,
      imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702',
      categoryId: bySlug.makeup,
    },
    {
      name: 'Silk Repair Hair Mask',
      slug: 'silk-repair-hair-mask',
      description: 'Deep treatment mask for dry and damaged hair.',
      price: 29,
      stockQuantity: 65,
      imageUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f',
      categoryId: bySlug.haircare,
    },
    {
      name: 'Amber Bloom Eau de Parfum',
      slug: 'amber-bloom-eau-de-parfum',
      description: 'Warm floral fragrance with amber and vanilla notes.',
      price: 54,
      stockQuantity: 50,
      imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601',
      categoryId: bySlug.fragrance,
    },
  ];

  for (const product of products) {
    if (!product.categoryId) continue;
    const { categoryId, ...rest } = product;
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: rest.name,
        description: rest.description,
        price: rest.price,
        stockQuantity: rest.stockQuantity,
        imageUrl: rest.imageUrl,
        categoryId,
        isActive: true,
        productStatus: ProductStatus.APPROVED,
      },
      create: {
        ...rest,
        category: {
          connect: {
            id: categoryId,
          },
        },
        isActive: true,
        productStatus: ProductStatus.APPROVED,
      },
    });
  }

  console.log({ adminId: admin.id, customerId: customer.id, seeded: true });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
