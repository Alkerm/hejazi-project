import { PrismaClient } from '@prisma/client';
import { DEFAULT_POLICIES } from '../modules/policies/policies.service';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating all store policies to latest content...\n');

  for (const p of DEFAULT_POLICIES) {
    await prisma.storePolicy.upsert({
      where: { id: p.id },
      update: {
        titleEn: p.titleEn,
        titleAr: p.titleAr,
        summaryEn: p.summaryEn,
        summaryAr: p.summaryAr,
        contentEn: p.contentEn,
        contentAr: p.contentAr,
      },
      create: {
        id: p.id,
        slug: p.slug,
        titleEn: p.titleEn,
        titleAr: p.titleAr,
        summaryEn: p.summaryEn,
        summaryAr: p.summaryAr,
        contentEn: p.contentEn,
        contentAr: p.contentAr,
      },
    });
    console.log(`  ✅ Updated: ${p.titleEn} / ${p.titleAr}`);
  }

  console.log('\n🎉 All policies updated successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
