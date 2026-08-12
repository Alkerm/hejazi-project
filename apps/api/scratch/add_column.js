import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "arabicDescription" TEXT;`);
  console.log('Successfully added arabicDescription column to Product table!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
