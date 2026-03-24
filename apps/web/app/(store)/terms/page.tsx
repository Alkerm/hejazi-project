import { PolicyPageTemplate } from '@/components/store/policy-page';

export default function TermsPage() {
  return (
    <PolicyPageTemplate
      title="Terms & Conditions"
      summary="Template page for store terms. Fill this with the final legal text approved for launch."
      sections={[
        {
          heading: 'Store Identity',
          body:
            'TODO: State the legal entity name, Commercial Registration number, registered address, support email, and support phone number.',
        },
        {
          heading: 'Orders and Acceptance',
          body:
            'TODO: Explain when an order is considered received, when it is accepted, and circumstances where it may be declined or cancelled.',
        },
        {
          heading: 'Pricing and Payment',
          body:
            'TODO: Confirm currency, whether prices include VAT, accepted payment methods, and when payment is captured.',
        },
        {
          heading: 'Product Information',
          body:
            'TODO: Clarify that product images and descriptions are provided for guidance, and that usage must follow product labeling and warnings.',
        },
      ]}
    />
  );
}
