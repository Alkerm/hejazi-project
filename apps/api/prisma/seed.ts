import { PrismaClient, ProductStatus, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  const demoPassword = process.env.SEED_USER_PASSWORD || 'HalfLink2026!';
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cosmetics.local' },
    update: {
      firstName: 'Half Link',
      lastName: 'Admin',
      passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      firstName: 'Half Link',
      lastName: 'Admin',
      email: 'admin@cosmetics.local',
      passwordHash,
      role: UserRole.ADMIN,
      phone: '+966500000001',
      cart: { create: {} },
      addresses: {
        create: {
          line1: 'King Fahd Road',
          city: 'Riyadh',
          country: 'Saudi Arabia',
          postalCode: '11564',
          isDefault: true,
        },
      },
    },
  });

  const categoriesData = [
    { name: 'Surveillance Cameras', slug: 'monitoring-cameras' },
    { name: 'Power Stations & Batteries', slug: 'power-batteries' },
    { name: 'Solar Energy Systems', slug: 'solar-energy' },
    { name: 'Power Accessories', slug: 'power-accessories' },
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
      name: 'Half Link Pro 4G Solar Security Camera 4K',
      arabicName: 'كاميرة هالف لينك طاقة شمسية 4G بمجال رؤية 360',
      slug: 'half-link-pro-4g-solar-camera-4k',
      description: '4K Dual Lens Outdoor Security Camera with 4G SIM Card Support, 12W Solar Panel, Color Night Vision, and AI Human Motion Tracking. Ideal for remote camps, chalets, and outdoor properties.',
      arabicDescription: 'كاميرة مراقبة تعمل بالكامل بالطاقة الشمسية مع شريحة 4G بدقة 4K فائقة الوضوح، تتبع ذكي ورؤية ليلية ملونة، مناسبة للمخيمات والمزارع والشاليهات والمنازل.',
      price: 699,
      stockQuantity: 45,
      imageUrl: 'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?q=80&w=800&auto=format&fit=crop',
      categoryId: bySlug['monitoring-cameras'],
    },
    {
      name: 'Half Link GigMax 51.2V 100Ah (5.12kWh) LiFePO4 Battery',
      arabicName: 'بطارية هالف لينك ليثيوم جيجا 5.12 كيلوواط للمنازل والمخيمات',
      slug: 'half-link-gigmax-51v-lifepo4-battery',
      description: 'Heavy-duty 51.2V 100Ah Lithium Iron Phosphate wall-mounted battery bank. 6000+ deep cycles with smart BMS protection. Designed to power homes, chalets, and camps continuously.',
      arabicDescription: 'بطارية ليثيوم جدارية بسعة 5.12 كيلوواط عمر افتراضي 6000 دورة، مزودة بنظام حماية ذكي تغذي المنازل والشاليهات والمخيمات بالكهرباء المستدامة.',
      price: 3450,
      stockQuantity: 25,
      imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop',
      categoryId: bySlug['power-batteries'],
    },
    {
      name: 'Half Link CampPro Portable Power Generator 2400W',
      arabicName: 'محطة طاقة متنقلة هالف لينك للمخيمات والرحلات 2400 واط',
      slug: 'half-link-camppro-portable-power-station',
      description: 'Ultra-quiet 2048Wh capacity portable power generator with 2400W pure sine wave AC output. Powers camp refrigerators, lighting, electronics, and heavy outdoor equipment.',
      arabicDescription: 'مولد كهربائي متنقل بسعة 2048 واط/ساعة وقوة 2400 واط لتشغيل الثلاجات والإضاءات وأجهزة التخييم والبر بدون صوت أو انبعاثات.',
      price: 2890,
      stockQuantity: 30,
      imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop',
      categoryId: bySlug['power-batteries'],
    },
    {
      name: 'Half Link Smart Dual-Lens PTZ Dome Camera 8MP',
      arabicName: 'كاميرة مراقبة ذكية متحركة 8 ميجابكسل Wi-Fi',
      slug: 'half-link-smart-ptz-dome-camera-8mp',
      description: '360-degree PTZ Wi-Fi camera with 8MP Ultra HD resolution, 2-way voice intercom, spotlight alarm, and auto-tracking capabilities.',
      arabicDescription: 'كاميرة مراقبة متحركة 360 درجة بدقة 8 ميجابكسل، صوت ثنائي الاتجاه، إضاءة كاشفة وتنبيه فوري عند التقاط الحركة.',
      price: 299,
      stockQuantity: 80,
      imageUrl: 'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?q=80&w=800&auto=format&fit=crop',
      categoryId: bySlug['monitoring-cameras'],
    },
    {
      name: 'Half Link Monocrystalline Solar Panel 450W Heavy Duty',
      arabicName: 'لوح طاقة شمسية هالف لينك أحادي البلورة 450 واط',
      slug: 'half-link-mono-solar-panel-450w',
      description: 'High-efficiency 450W PERC Monocrystalline solar panel built with tempered anti-reflective glass for maximum charging efficiency in desert climate.',
      arabicDescription: 'لوح طاقة شمسية عالي الكفاءة بقدرة 450 واط مصمم لتحمل الظروف الجوية القاسية وأشعة الشمس المباشرة في الصحراء.',
      price: 520,
      stockQuantity: 100,
      imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=800&auto=format&fit=crop',
      categoryId: bySlug['solar-energy'],
    },
    {
      name: 'Half Link Smart MPPT Solar Hybrid Inverter 5KW',
      arabicName: 'محول طاقة شمسية هجين هالف لينك 5 كيلوواط مع شاحن ذكي',
      slug: 'half-link-mppt-hybrid-solar-inverter-5kw',
      description: '5000W Hybrid Solar Inverter 48V to 220V with built-in 100A MPPT solar charge controller. Seamless power transfer between solar, grid, and battery storage.',
      arabicDescription: 'محول طاقة هجين 5000 واط يحول جهد البطاريات 48 فولت إلى 220 فولت مع منظم شحن MPPT لشحن البطاريات من الشمس والشبكة وتغذية المنزل.',
      price: 1980,
      stockQuantity: 20,
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
      categoryId: bySlug['power-accessories'],
    },
  ];

  for (const product of products) {
    if (!product.categoryId) continue;
    const { categoryId, ...rest } = product;
    await prisma.product.create({
      data: {
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

  console.log('Clean Half Link Catalog Seeded Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
