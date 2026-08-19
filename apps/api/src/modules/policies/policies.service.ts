import { prisma } from '../../prisma/client';
import { AppError } from '../../utils/app-error';
import { UpdatePolicyInput } from './policies.schemas';
import { createAuditLog } from '../admin/admin.repository';

export const DEFAULT_POLICIES = [
  {
    id: 'terms',
    slug: 'terms',
    titleEn: 'Terms & Conditions',
    titleAr: 'الشروط والأحكام',
    summaryEn: 'Official legal terms governing all transactions, orders, and services provided by our store.',
    summaryAr: 'الشروط والأحكام القانونية الرسمية التي تحكم جميع التعاملات والطلبات والخدمات في متجرنا.',
    contentEn: `### 1. Store Identity & Legal Framework
This store operates under the commercial regulations of the Kingdom of Saudi Arabia. All products, transactions, and consumer rights comply with the Ministry of Commerce and SFDA guidelines.

### 2. Orders and Acceptance
- Placing an order constitutes an offer to purchase products subject to confirmation and inventory availability.
- Order confirmation is sent via SMS/Email once checkout is successfully completed.
- We reserve the right to cancel any order in case of pricing errors or inventory stock unavailability with full prompt refund.

### 3. Pricing and VAT
- All stated product prices are in Saudi Riyals (SAR) and include Value Added Tax (VAT) at the statutory 15% rate where applicable.
- Invoices detailing the tax breakdown and commercial registration are issued with every order.

### 4. Product Descriptions and Guidance
- Product specifications, safety warnings, ingredients, and usage instructions are provided accurately for consumer guidance. Customers must adhere to manufacturer labels and instructions.`,
    contentAr: `### ١. هوية المتجر والإطار النظامي
يعمل هذا المتجر وفقاً للأنظمة واللوائح التجارية المعمول بها في المملكة العربية السعودية، وتخضع جميع المنتجات والتعاملات لضوابط وزارة التجارة وهيئة الغذاء والدواء.

### ٢. الطلبات والقبول
- يُعد إتمام الطلب من قبل العميل بمثابة عرض للشراء يخضع للتأكيد وتوفر الكميات في المخزون.
- يتم إشعار العميل بتأكيد الطلب فور إتمام عملية الدفع بنجاح عبر البريد الإلكتروني والرسائل النصية.
- يحق للمتجر إلغاء الطلب في حال نفاد الكمية أو حدوث خطأ غير مقصود في التسعير مع استرداد العميل للمبلغ كاملاً فوراً.

### ٣. الأسعار وضريبة القيمة المضافة
- جميع الأسعار المعروضة بالريال السعودي (SAR) وتشمل ضريبة القيمة المضافة بنسبة ١٥٪ وفق الأنظمة المعمول بها.
- يتم إصدار فاتورة ضريبية إلكترونية معتمدة لكل طلب موضحاً بها تفاصيل الضريبة والسجل التجاري.

### ٤. بيانات المنتجات وإرشادات الاستخدام
- يتم توضيح مواصفات المنتجات والمكونات وإرشادات الاستخدام والتحذيرات بكل دقة. ويجب على العميل الالتزام بالتعليمات المدونة على العبوة.`,
  },
  {
    id: 'privacy',
    slug: 'privacy',
    titleEn: 'Privacy Policy',
    titleAr: 'سياسة الخصوصية',
    summaryEn: 'How we collect, protect, and process your personal data in full compliance with Saudi Personal Data Protection Law (PDPL).',
    summaryAr: 'كيفية جمع وحماية ومعالجة بياناتك الشخصية بما يتوافق تماماً مع نظام حماية البيانات الشخصية في المملكة.',
    contentEn: `### 1. Personal Data We Collect
We collect necessary personal information to process orders and provide exceptional delivery service, including: Name, National ID / Iqama (when required for identity validation), Contact Number, Delivery Address with GPS pin, and Email Address.

### 2. Purpose of Data Processing
- Fulfilling orders, managing shipping with authorized delivery drivers, and providing tracking updates.
- Processing payments securely via licensed payment gateways (we never store raw credit card details).
- Providing customer care, warranty service, and optional promotional announcements.

### 3. Data Protection and Security
We implement bank-grade encryption protocols (HTTPS/TLS) and strict access control to safeguard your information against unauthorized access or disclosure.

### 4. Your Rights
Under the Saudi Personal Data Protection Law, you have the right to access, correct, or request deletion of your personal data at any time through your profile or customer support.`,
    contentAr: `### ١. البيانات الشخصية التي نجمعها
نقوم بجمع البيانات الضرورية لإتمام الطلبات والتوصيل بأعلى معايير الجودة، بما يشمل: الاسم، رقم الهوية الوطنية / الإقامة (عند الحاجة للتحقق)، رقم الجوال، عنوان التوصيل مع إحداثيات الموقع، والبريد الإلكتروني.

### ٢. الغرض من معالجة البيانات
- تجهيز وشحن الطلبات عبر السائقين المعتمدين وتزويدك بالتحديثات المباشرة للشحنة.
- معالجة المدفوعات بأمان عبر بوابات الدفع الإلكتروني المرخصة (لا نقوم بحفظ أرقام البطاقات الائتمانية).
- تقديم خدمات الدعم الفني والضمان والإشعارات العامة للعملاء.

### ٣. حماية وأمن البيانات
نطبق أعلى معايير التشفير الرقمي والبروتوكولات الأمنية الصارمة لحماية خصوصية بياناتك ومنع أي وصول غير مصرح به.

### ٤. حقوق العميل
وفقاً لنظام حماية البيانات الشخصية السعودي، يحق لك الوصول إلى بياناتك أو تحديثها أو طلب حذفها في أي وقت من خلال ملفك الشخصي أو التواصل مع الدعم.`,
  },
  {
    id: 'shipping-delivery',
    slug: 'shipping-delivery',
    titleEn: 'Shipping & Delivery Policy',
    titleAr: 'سياسة الشحن والتوصيل',
    summaryEn: 'Delivery timelines, shipping coverage across Saudi Arabia, order dispatch processes, and live GPS tracking.',
    summaryAr: 'أوقات التوصيل، التغطية الجغرافية في مدن المملكة، آلية تسليم الشحنات والتتبع المباشر.',
    contentEn: `### 1. Delivery Coverage
We deliver across all major cities and provinces throughout the Kingdom of Saudi Arabia, including Riyadh, Jeddah, Makkah, Madinah, Dammam, Khobar, and all surrounding governorates.

### 2. Shipping Timeframes
- **Express Same-Day Delivery**: Available in major metropolitan areas for orders placed before 3:00 PM.
- **Standard Delivery**: 1 to 3 business days across all Kingdom regions.

### 3. Live Driver Tracking & Pin Location
Customers can provide their exact map pin at checkout. Once dispatched, live driver tracking is available from your order details page.

### 4. Shipping Fees
- Fixed standard shipping is SAR 25.00.
- Orders above qualified promotional amounts receive FREE standard delivery.`,
    contentAr: `### ١. نطاق التغطية والتوصيل
نوصل إلى جميع المدن والمحافظات في كافة مناطق المملكة العربية السعودية (الرياض، جدة، مكة المكرمة، المدينة المنورة، الدمام، الخبر، وكافة المناطق الأخرى).

### ٢. المواعيد الزمنية للتوصيل
- **التوصيل السريع في نفس اليوم**: متاح في المدن الرئيسية للطلبات المؤكدة قبل الساعة ٣:٠٠ عصراً.
- **التوصيل القياسي**: من يوم إلى ٣ أيام عمل لكافة مناطق ومحافظات المملكة.

### ٣. التتبع المباشر وإحداثيات الموقع
يمكن للعميل تحديد موقع التوصيل بدقة عبر الخريطة أثناء إتمام الطلب، ويتاح تتبع السائق المباشر فور خروج الشحنة للتوصيل.

### ٤. رسوم الشحن والتوصيل
- رسوم التوصيل القياسية الثابتة هي ٢٥.٠٠ ر.س.
- الشحن مجاني للطلبات التي تتجاوز القيمة الترويجية المحددة.`,
  },
  {
    id: 'returns-refunds',
    slug: 'returns-refunds',
    titleEn: 'Returns, Refunds & Warranty',
    titleAr: 'سياسة الإرجاع والاستبدال والضمان',
    summaryEn: 'Transparent rules for returning products, warranty coverage, replacement eligibility, and refund processing.',
    summaryAr: 'ضوابط شفافة لإرجاع واستبدال المنتجات، شروط الضمان المعتمد، وآلية استرداد المبالغ المالية.',
    contentEn: `### 1. Return Window
In accordance with Saudi Ministry of Commerce regulations, customers may request a return or exchange within **7 days** of delivery for unopened and sealed items in their original packaging.

### 2. Non-Returnable Items
For health, safety, and hygiene reasons:
- Products whose factory security seal or protective wrap has been opened or tampered with.
- Items subjected to improper storage, extreme heat, or misuse.

### 3. Defective or Damaged Products
If an item arrives damaged or defective, notify us within 48 hours with order details and photos. We will immediately dispatch a free replacement or issue a 100% refund including shipping fees.

### 4. Refund Processing Time
Approved refunds are processed back to the original payment method within **3 to 7 business days** depending on the customer's bank.`,
    contentAr: `### ١. المدة الزمنية للإرجاع والاستبدال
وفقاً للائحة التنفيذية لوزارة التجارة، يحق للعميل طلب إرجاع أو استبدال المنتجات خلال **٧ أيام** من تاريخ استلام الطلب، بشرط أن تكون بحالتها الأصلية المغلفة وغير مفتوحة.

### ٢. المنتجات غير القابلة للإرجاع
حفاظاً على الصحة العامة والسلامة:
- المنتجات التي تم فتح غلافها الأصلي أو إزالة لاصق الأمان الخاص بها.
- المنتجات التي تعرضت للتلف الناتج عن سوء التخزين أو الاستخدام.

### ٣. المنتجات التالفة أو المعيبة
في حال وصول منتج تالف أو به عيب مصنعي، يرجى إبلاغنا خلال ٤٨ ساعة مع إرفاق صور المنتج، وسنتولى استبداله فوراً أو استرداد كامل المبلغ شاملاً رسوم الشحن.

### ٤. مدة استرداد المبالغ المالية
تتم إعادة المبالغ المستحقة لنفس وسيلة الدفع الأصلية خلال **٣ إلى ٧ أيام عمل** حسب سياسة البنك المصدر للبطاقة.`,
  },
  {
    id: 'complaints-contact',
    slug: 'complaints-contact',
    titleEn: 'Complaints & Customer Care',
    titleAr: 'سياسة الشكاوى وخدمة العملاء',
    summaryEn: 'Our commitment to prompt resolution of customer inquiries, feedback, dispute escalation, and care channels.',
    summaryAr: 'التزامنا بالاستجابة السريعة لاستفسارات وشكاوى العملاء، وقنوات التواصل المباشرة وخدمة العملاء.',
    contentEn: `### 1. Customer Care Commitment
We are committed to delivering the highest standards of customer satisfaction. Every inquiry or feedback is treated with the utmost care and transparency.

### 2. Official Channels for Support
- **Support Tickets System**: Submit a ticket directly from your account under the Support page.
- **Direct Email**: support@store.com
- **Direct WhatsApp & Phone**: Available during business hours (9:00 AM – 10:00 PM KSA time).

### 3. Complaint Resolution Timeline
- Initial acknowledgment within **2 to 4 hours**.
- Full investigation and definitive resolution provided within **24 to 48 business hours**.
- If a customer is unsatisfied with the resolution, the ticket may be escalated to executive management for review.`,
    contentAr: `### ١. التزامنا بخدمة العملاء
نلتزم بتقديم أعلى مستويات الرضا والاهتمام بعملائنا الكرام، ونتعامل مع كل استفسار أو مقترح أو شكوى بمنتهى الشفافية والاهتمام.

### ٢. القنوات الرسمية للتواصل والدعم
- **نظام التذاكر المباشر**: يمكن رفع تذكرة دعم فني مباشرة من صفحة الدعم الفني في حسابك.
- **البريد الإلكتروني للدعم**: support@store.com
- **الواتساب والهاتف**: متاح طوال أيام الأسبوع خلال ساعات العمل (٩:٠٠ ص - ١٠:٠٠ م بتوقيت مكة المكرمة).

### ٣. أوقات معالجة الشكاوى
- يتم تأكيد استلام الشكوى خلال **٢ إلى ٤ ساعات**.
- يتم التحقيق في الشكوى وتقديم الحل النهائي خلال **٢٤ إلى ٤٨ ساعة عمل**.
- في حال عدم الرضا عن الحل، يتم تصعيد التذكرة تلقائياً للإدارة العليا لمراجعتها والتأكد من إنصاف العميل.`,
  },
];

export const ensurePoliciesSeeded = async () => {
  const count = await prisma.storePolicy.count();
  if (count < DEFAULT_POLICIES.length) {
    for (const p of DEFAULT_POLICIES) {
      await prisma.storePolicy.upsert({
        where: { id: p.id },
        update: {},
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
    }
  }
};

export const getStorePoliciesService = async () => {
  await ensurePoliciesSeeded();
  return prisma.storePolicy.findMany({
    orderBy: { createdAt: 'asc' },
  });
};

export const getStorePolicyBySlugService = async (slug: string) => {
  await ensurePoliciesSeeded();
  let policy = await prisma.storePolicy.findFirst({
    where: {
      OR: [{ id: slug }, { slug }],
    },
  });

  if (!policy) {
    // Fallback to default in-memory definition if not in DB yet
    const def = DEFAULT_POLICIES.find((p) => p.slug === slug || p.id === slug);
    if (!def) {
      throw new AppError('Policy not found', 404, 'POLICY_NOT_FOUND');
    }
    policy = await prisma.storePolicy.create({
      data: def,
    });
  }

  return policy;
};

export const updateStorePolicyService = async (
  adminUserId: string,
  id: string,
  input: UpdatePolicyInput,
) => {
  await ensurePoliciesSeeded();
  const existing = await prisma.storePolicy.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
  });

  if (!existing) {
    throw new AppError('Policy not found', 404, 'POLICY_NOT_FOUND');
  }

  const updated = await prisma.storePolicy.update({
    where: { id: existing.id },
    data: {
      titleEn: input.titleEn,
      titleAr: input.titleAr,
      summaryEn: input.summaryEn,
      summaryAr: input.summaryAr,
      contentEn: input.contentEn,
      contentAr: input.contentAr,
    },
  });

  await createAuditLog({
    adminUserId,
    action: 'UPDATE_STORE_POLICY',
    entityType: 'STORE_POLICY',
    entityId: updated.id,
    metadata: {
      policyId: updated.id,
      titleEn: updated.titleEn,
      titleAr: updated.titleAr,
    },
  });

  return updated;
};

export const resetStorePolicyToDefaultService = async (adminUserId: string, id: string) => {
  const def = DEFAULT_POLICIES.find((p) => p.id === id || p.slug === id);
  if (!def) {
    throw new AppError('Default policy template not found', 404, 'POLICY_NOT_FOUND');
  }

  const updated = await prisma.storePolicy.upsert({
    where: { id: def.id },
    update: {
      titleEn: def.titleEn,
      titleAr: def.titleAr,
      summaryEn: def.summaryEn,
      summaryAr: def.summaryAr,
      contentEn: def.contentEn,
      contentAr: def.contentAr,
    },
    create: def,
  });

  await createAuditLog({
    adminUserId,
    action: 'RESET_STORE_POLICY_DEFAULT',
    entityType: 'STORE_POLICY',
    entityId: updated.id,
    metadata: {
      policyId: updated.id,
    },
  });

  return updated;
};
