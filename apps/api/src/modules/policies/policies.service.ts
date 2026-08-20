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
    summaryEn: 'Official legal terms governing all transactions, orders, and services provided by our store in full compliance with Saudi Ministry of Commerce regulations.',
    summaryAr: 'الشروط والأحكام القانونية الرسمية التي تحكم جميع التعاملات والطلبات والخدمات في متجرنا وفقاً لأنظمة وزارة التجارة بالمملكة العربية السعودية.',
    contentEn: `### 1. Store Identity & Legal Framework
This store operates under the commercial regulations of the Kingdom of Saudi Arabia. All transactions, consumer rights, and product compliance are governed by the Ministry of Commerce, SASO standards, and the Communications, Space & Technology Commission (CST) where applicable.

**Commercial Registration (CR):** Issued by the Ministry of Commerce – Kingdom of Saudi Arabia.
**VAT Registration:** Registered with the Zakat, Tax and Customs Authority (ZATCA) – VAT rate 15%.
**SBC Verified Store:** Authenticated and certified by the Saudi Business Center (المركز السعودي للأعمال).

### 2. Orders and Acceptance
- Placing an order constitutes an offer to purchase products subject to confirmation and inventory availability.
- Order confirmation is sent via SMS/Email once checkout is successfully completed.
- We reserve the right to cancel any order in case of pricing errors or inventory stock unavailability with a full, prompt refund.

### 3. Pricing and VAT
- All stated product prices are in Saudi Riyals (SAR) and include Value Added Tax (VAT) at the statutory 15% rate.
- A fully itemized electronic tax invoice (فاتورة ضريبية إلكترونية) compliant with ZATCA Phase 2 e-invoicing standards is issued with every order, detailing the VAT amount, commercial registration number, and product breakdown.

### 4. Product Descriptions, Safety & Compliance
- Product specifications, safety warnings, certifications (SASO/SABER), and usage instructions are provided accurately for consumer guidance.
- Customers must adhere to manufacturer labels and all applicable laws. Misuse of any purchased product contrary to Saudi law remains the sole responsibility of the purchaser.
- Surveillance cameras and security systems sold on this platform must be used strictly in accordance with the Royal Decree on Security Camera Regulations. Usage that violates personal privacy or constitutes electronic espionage is prohibited under the Saudi Anti-Cyber Crime Law.

### 5. Governing Law & Jurisdiction
These Terms & Conditions are governed exclusively by the laws and regulations of the Kingdom of Saudi Arabia. Any dispute arising from transactions on this store shall be subject to the jurisdiction of the competent Saudi courts.`,
    contentAr: `### ١. هوية المتجر والإطار النظامي
يعمل هذا المتجر وفقاً للأنظمة واللوائح التجارية المعمول بها في المملكة العربية السعودية، وتخضع جميع المنتجات والتعاملات لضوابط وزارة التجارة والهيئة السعودية للمواصفات والمقاييس والجودة (ساسو) وهيئة الاتصالات والفضاء والتقنية.

**السجل التجاري (CR):** صادر من وزارة التجارة - المملكة العربية السعودية.
**الرقم الضريبي للقيمة المضافة:** مسجل لدى هيئة الزكاة والضريبة والجمارك (زاتكا) - نسبة الضريبة ١٥٪.
**متجر موثق من المركز السعودي للأعمال (SBC):** معتمد ومُوثَّق رسمياً من المركز السعودي للأعمال.

### ٢. الطلبات والقبول
- يُعد إتمام الطلب من قبل العميل بمثابة عرض للشراء يخضع للتأكيد وتوفر الكميات في المخزون.
- يتم إشعار العميل بتأكيد الطلب فور إتمام عملية الدفع بنجاح عبر البريد الإلكتروني والرسائل النصية.
- يحق للمتجر إلغاء الطلب في حال نفاد الكمية أو حدوث خطأ غير مقصود في التسعير مع استرداد العميل للمبلغ كاملاً فوراً.

### ٣. الأسعار وضريبة القيمة المضافة
- جميع الأسعار المعروضة بالريال السعودي (SAR) وتشمل ضريبة القيمة المضافة بنسبة ١٥٪ وفق الأنظمة المعمول بها.
- يتم إصدار فاتورة ضريبية إلكترونية معتمدة متوافقة مع متطلبات زاتكا (المرحلة الثانية) لكل طلب، موضحاً بها رقم الفاتورة، ورقم السجل التجاري، وتفاصيل الضريبة، وتفاصيل المنتجات.

### ٤. بيانات المنتجات والسلامة والامتثال التنظيمي
- يتم توضيح مواصفات المنتجات وشهادات المطابقة (سابر/ساسو) وإرشادات الاستخدام والتحذيرات بكل دقة. ويجب على العميل الالتزام بالتعليمات المدونة على العبوة.
- يجب استخدام كاميرات المراقبة والأنظمة الأمنية المُباعة عبر هذا المتجر وفقاً للائحة التنفيذية لنظام كاميرات المراقبة الأمنية الصادرة بالمرسوم الملكي. يُحظر استخدامها لانتهاك الخصوصية أو التجسس وفق نظام مكافحة جرائم المعلوماتية السعودي.

### ٥. القانون الحاكم والاختصاص القضائي
تخضع هذه الشروط والأحكام حصراً للأنظمة واللوائح المعمول بها في المملكة العربية السعودية، وتختص المحاكم السعودية المختصة بالنظر في أي نزاع ينشأ عن التعاملات في هذا المتجر.`,
  },
  {
    id: 'privacy',
    slug: 'privacy',
    titleEn: 'Privacy Policy',
    titleAr: 'سياسة الخصوصية',
    summaryEn: 'How we collect, protect, and process your personal data in full compliance with Saudi Personal Data Protection Law (PDPL / SDAIA).',
    summaryAr: 'كيفية جمع وحماية ومعالجة بياناتك الشخصية بما يتوافق تماماً مع نظام حماية البيانات الشخصية الصادر عن الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).',
    contentEn: `### 1. Personal Data We Collect
We collect necessary personal information to process orders and provide exceptional delivery service, including: Name, Saudi National Address (Building No., Street, District, City, Short Address Code), Contact Phone Number, and Email Address.

### 2. Purpose of Data Processing
- Fulfilling orders and managing shipping with authorized delivery couriers (SPL / SMSA / Aramex), and providing shipment tracking updates.
- Processing payments securely via licensed Saudi payment gateways (Moyasar / Tap / HyperPay). We never store raw card numbers.
- Providing customer care, warranty service, and optional promotional announcements with your explicit consent.

### 3. Data Protection and Security
We implement bank-grade encryption protocols (HTTPS/TLS 1.3) and strict role-based access control to safeguard your information against unauthorized access or disclosure, in full accordance with SDAIA regulations.

### 4. Your Rights (PDPL)
Under the Saudi Personal Data Protection Law (PDPL), you have the right to:
- **Access** your personal data held by us.
- **Correct** any inaccurate information.
- **Request deletion** of your account and all associated personal data at any time, instantly via your Profile page or by contacting customer support.

### 5. Surveillance Camera Purchase Notice
Purchasers of surveillance cameras and security systems acknowledge that such products must be used in compliance with all applicable Saudi laws governing privacy and surveillance. The store bears no liability for any unlawful use by the purchaser.`,
    contentAr: `### ١. البيانات الشخصية التي نجمعها
نقوم بجمع البيانات الضرورية لإتمام الطلبات والتوصيل بأعلى معايير الدقة، بما يشمل: الاسم، العنوان الوطني السعودي المعتمد (رقم المبنى، الشارع، الحي، المدينة، الرمز المختصر)، رقم الجوال، والبريد الإلكتروني.

### ٢. الغرض من معالجة البيانات
- تنفيذ الطلبات وإدارة الشحن عبر شركات التوصيل المعتمدة (سبل / SMSA / أرامكس) وتزويد العميل بتحديثات تتبع الشحنة.
- معالجة المدفوعات بأمان عبر بوابات الدفع الإلكتروني المرخصة من البنك المركزي السعودي (ميسر / تاب / هايبر باي). لا نقوم بحفظ أرقام البطاقات الائتمانية.
- تقديم خدمات الدعم الفني والضمان، وإرسال الإشعارات الترويجية بموافقتك الصريحة فقط.

### ٣. حماية وأمن البيانات
نطبق أعلى معايير التشفير الرقمي (HTTPS/TLS 1.3) وضوابط الوصول الصارمة لحماية خصوصية بياناتك ومنع أي وصول غير مصرح به، وذلك وفقاً للوائح الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).

### ٤. حقوقك وفق نظام حماية البيانات الشخصية (PDPL)
وفقاً لنظام حماية البيانات الشخصية السعودي، يحق لك:
- **الاطلاع** على بياناتك الشخصية المحفوظة لدينا.
- **تصحيح** أي بيانات غير دقيقة.
- **طلب حذف** حسابك وجميع بياناتك الشخصية في أي وقت بشكل فوري من صفحة ملفك الشخصي أو من خلال التواصل مع خدمة العملاء.

### ٥. إشعار خاص بمشتري كاميرات المراقبة
يُقر مشتري كاميرات المراقبة والأنظمة الأمنية بأن استخدام هذه المنتجات يجب أن يكون وفقاً لجميع الأنظمة والقوانين السارية في المملكة العربية السعودية المتعلقة بالخصوصية والمراقبة. لا يتحمل المتجر أي مسؤولية عن أي استخدام غير مشروع من قِبل المشتري.`,
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
    summaryEn: 'Transparent rules for returning products, mandatory 2-year warranty on electronics, replacement eligibility, and refund processing per Saudi Ministry of Commerce regulations.',
    summaryAr: 'ضوابط شفافة لإرجاع واستبدال المنتجات، ضمان سنتين إلزامي للأجهزة الكهربائية والإلكترونية وفق وزارة التجارة، وآلية استرداد المبالغ المالية.',
    contentEn: `### 1. Return Window
In accordance with Saudi Ministry of Commerce regulations, customers may request a return or exchange within **7 days** of delivery for unopened and sealed items in their original packaging.

### 2. Non-Returnable Items
For safety and integrity reasons the following cannot be returned:
- Products whose factory security seal or protective wrap has been opened or tampered with.
- Items subjected to improper installation, storage, extreme heat, water damage, or misuse contrary to product instructions.
- Custom-configured or special-order products.

### 3. Defective or Damaged Products
If an item arrives damaged or has a manufacturing defect, notify us within **48 hours** with your order number and clear photos. We will immediately dispatch a free replacement or issue a 100% refund including all shipping fees at no cost to you.

### 4. Mandatory 2-Year Warranty (Electronics & Electrical Devices)
In full compliance with Saudi Ministry of Commerce consumer protection regulations, **all electrical devices, electronics, surveillance cameras, power systems, and inverters carry a mandatory minimum warranty of 2 years (24 months)** from the date of purchase against manufacturing defects.

Warranty coverage includes:
- Free repair or replacement of defective units within the warranty period.
- Availability of spare parts and authorized service centers for the duration of the warranty.
- Warranty is void in cases of: physical damage caused by the user, unauthorized tampering or third-party repair, use contrary to the product's rated specifications (voltage, environment, load), or natural disasters.

### 5. Surveillance Camera Warranty Notice
Surveillance cameras and security systems are warranted against hardware defects only. The store bears no responsibility for installation errors or use contrary to Saudi surveillance regulations. Professional installation is strongly recommended.

### 6. Refund Processing Time
Approved refunds are processed back to the original payment method within **3 to 7 business days** depending on the customer's bank or payment provider.`,
    contentAr: `### ١. المدة الزمنية للإرجاع والاستبدال
وفقاً للائحة التنفيذية لوزارة التجارة، يحق للعميل طلب إرجاع أو استبدال المنتجات خلال **٧ أيام** من تاريخ استلام الطلب، بشرط أن تكون بحالتها الأصلية المغلفة وغير مفتوحة.

### ٢. المنتجات غير القابلة للإرجاع
لا يمكن إرجاع المنتجات في الحالات التالية:
- المنتجات التي تم فتح غلافها الأصلي أو إزالة لاصق الأمان الخاص بها.
- المنتجات التي تعرضت للتلف الناتج عن سوء التركيب أو التخزين أو الاستخدام المخالف للتعليمات.
- المنتجات المخصصة أو المطلوبة بشكل خاص (طلب خاص).

### ٣. المنتجات التالفة أو المعيبة
في حال وصول منتج تالف أو به عيب مصنعي، يرجى إبلاغنا خلال **٤٨ ساعة** مع رقم الطلب وصور واضحة للمنتج، وسنتولى استبداله فوراً أو استرداد كامل المبلغ شاملاً رسوم الشحن دون أي تكلفة إضافية عليك.

### ٤. الضمان الإلزامي لمدة سنتين (الأجهزة الكهربائية والإلكترونية)
التزاماً بأنظمة حماية المستهلك الصادرة عن وزارة التجارة بالمملكة العربية السعودية، **تتمتع جميع الأجهزة الكهربائية والإلكترونية وكاميرات المراقبة وأنظمة الطاقة والمحولات (إنفيرترات) المباعة عبر هذا المتجر بضمان إلزامي لا يقل عن سنتين (٢٤ شهراً)** من تاريخ الشراء ضد العيوب المصنعية.

يشمل الضمان:
- الإصلاح أو الاستبدال المجاني للوحدات المعيبة خلال فترة الضمان.
- توفر قطع الغيار ومراكز الخدمة المعتمدة طوال فترة الضمان.

يُلغى الضمان في حالات: الضرر الجسدي الناتج عن الاستخدام الخاطئ، الفك أو الإصلاح غير المصرح به، الاستخدام خارج المواصفات الفنية للمنتج (الجهد، البيئة، الحمل)، أو الكوارث الطبيعية.

### ٥. إشعار خاص بضمان كاميرات المراقبة
كاميرات المراقبة والأنظمة الأمنية مضمونة ضد العيوب المادية فقط. لا يتحمل المتجر أي مسؤولية عن أخطاء التركيب أو الاستخدام المخالف للوائح المراقبة السعودية. يُنصح بشدة بالاستعانة بفنيين معتمدين للتركيب.

### ٦. مدة استرداد المبالغ المالية
تتم إعادة المبالغ المستحقة لنفس وسيلة الدفع الأصلية خلال **٣ إلى ٧ أيام عمل** حسب سياسة البنك أو بوابة الدفع المصدرة.`,
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
  // Always upsert all default policies so that code changes
  // to DEFAULT_POLICIES are applied to existing DB records on restart.
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
