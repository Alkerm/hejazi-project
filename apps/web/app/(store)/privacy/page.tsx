import { PolicyPageTemplate } from '@/components/store/policy-page';

export default function PrivacyPage() {
  return (
    <PolicyPageTemplate
      slug="privacy"
      fallbackTitleEn="Privacy Policy"
      fallbackTitleAr="سياسة الخصوصية"
    />
  );
}
