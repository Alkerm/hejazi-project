import { PolicyPageTemplate } from '@/components/store/policy-page';

export default function TermsPage() {
  return (
    <PolicyPageTemplate
      slug="terms"
      fallbackTitleEn="Terms & Conditions"
      fallbackTitleAr="الشروط والأحكام"
    />
  );
}
