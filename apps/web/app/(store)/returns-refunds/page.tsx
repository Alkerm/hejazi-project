import { PolicyPageTemplate } from '@/components/store/policy-page';

export default function ReturnsRefundsPage() {
  return (
    <PolicyPageTemplate
      slug="returns-refunds"
      fallbackTitleEn="Returns, Refunds & Warranty"
      fallbackTitleAr="سياسة الإرجاع والاستبدال والضمان"
    />
  );
}
