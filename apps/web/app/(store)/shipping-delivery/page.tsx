import { PolicyPageTemplate } from '@/components/store/policy-page';

export default function ShippingDeliveryPage() {
  return (
    <PolicyPageTemplate
      slug="shipping-delivery"
      fallbackTitleEn="Shipping & Delivery Policy"
      fallbackTitleAr="سياسة الشحن والتوصيل"
    />
  );
}
