export const VAT_RATE = 0.15;
export const DEFAULT_SHIPPING_FEE = 0;
export const DEFAULT_DELIVERY_ESTIMATE = '3 to 5 business days';
export const DEFAULT_PAYMENT_METHOD_LABEL = 'Payment method to be confirmed';

export const storefrontSettings = {
  storeName: process.env.NEXT_PUBLIC_STORE_NAME ?? 'TODO: Store legal name',
  crNumber: process.env.NEXT_PUBLIC_STORE_CR ?? 'TODO: Commercial Registration number',
  email: process.env.NEXT_PUBLIC_STORE_EMAIL ?? 'TODO: support@example.com',
  phone: process.env.NEXT_PUBLIC_STORE_PHONE ?? 'TODO: +966XXXXXXXXX',
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS ?? 'TODO: Business address',
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
