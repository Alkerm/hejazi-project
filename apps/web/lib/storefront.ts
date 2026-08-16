export const VAT_RATE = 0.15;
export const DEFAULT_SHIPPING_FEE = 0;
export const DEFAULT_DELIVERY_ESTIMATE = '2 to 4 business days';
export const DEFAULT_PAYMENT_METHOD_LABEL = 'Payment method to be confirmed';

export const storefrontSettings = {
  storeName: process.env.NEXT_PUBLIC_STORE_NAME ?? 'Half Link Energy & Security',
  legalEntityName: process.env.NEXT_PUBLIC_STORE_LEGAL_NAME ?? 'Half Link Marketing Company',
  legalEntityNameArabic: 'شركة هاف لينك للتسويق',
  crNumber: process.env.NEXT_PUBLIC_STORE_CR ?? '1010867974',
  vatNumber: process.env.NEXT_PUBLIC_STORE_VAT ?? '311602607300003',
  email: process.env.NEXT_PUBLIC_STORE_EMAIL ?? 'mohammed@halflink.sa',
  phone: process.env.NEXT_PUBLIC_STORE_PHONE ?? '+966 50 043 7374',
  phoneClean: '+966500437374',
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS ?? 'King Abdulaziz Road, Riyadh 13326, Saudi Arabia',
  addressArabic: 'الرياض، طريق الملك عبدالعزيز، 13326، المملكة العربية السعودية',
  taxPeriod: 'Quarterly (ربع سنوي)',
  effectiveDate: '2023/05/01',
};

export const policyLinks = [
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/shipping-delivery', label: 'Shipping & Delivery' },
  { href: '/returns-refunds', label: 'Returns & Refunds' },
  { href: '/complaints-contact', label: 'Complaints & Contact' },
];

export const calculateVatAmount = (subtotal: number) => Number((subtotal * VAT_RATE).toFixed(2));
export const calculateOrderTotal = (subtotal: number, shippingAmount = DEFAULT_SHIPPING_FEE) =>
  Number((subtotal + calculateVatAmount(subtotal) + shippingAmount).toFixed(2));
