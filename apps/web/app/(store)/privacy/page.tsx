import { PolicyPageTemplate } from '@/components/store/policy-page';

export default function PrivacyPage() {
  return (
    <PolicyPageTemplate
      title="Privacy Policy"
      summary="Template page for personal data processing disclosures under your store privacy program."
      sections={[
        {
          heading: 'Data We Collect',
          body:
            'TODO: List the customer data collected through registration, checkout, support, and account management, such as name, email, phone, address, and order history.',
        },
        {
          heading: 'How We Use Data',
          body:
            'TODO: Explain use cases for order fulfillment, customer service, fraud prevention, legal compliance, and optional marketing consent.',
        },
        {
          heading: 'Sharing and Access',
          body:
            'TODO: Describe when data is shared with payment processors, shipping partners, or service providers, and limit this to what is necessary.',
        },
        {
          heading: 'Customer Rights',
          body:
            'TODO: Explain how customers can access, update, or request correction of their information, and how long records are retained.',
        },
      ]}
    />
  );
}
