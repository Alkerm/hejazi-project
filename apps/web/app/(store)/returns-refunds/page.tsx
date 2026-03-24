import { PolicyPageTemplate } from '@/components/store/policy-page';

export default function ReturnsRefundsPage() {
  return (
    <PolicyPageTemplate
      title="Returns / Refund Policy"
      summary="Template page for returns eligibility, refund handling, and exclusions."
      sections={[
        {
          heading: 'Return Eligibility',
          body:
            'TODO: Define which items are eligible for return, the allowed time window, and any hygiene or cosmetics-specific exclusions.',
        },
        {
          heading: 'Refund Process',
          body:
            'TODO: Describe how a customer requests a refund, what evidence may be required, and the expected refund timeline.',
        },
        {
          heading: 'Damaged or Incorrect Orders',
          body:
            'TODO: Provide the process for reporting damaged, defective, or incorrect shipments and the remedy options offered.',
        },
        {
          heading: 'Cancellation Rules',
          body:
            'TODO: Explain whether an order may be cancelled before shipment and how charges or refunds are handled.',
        },
      ]}
    />
  );
}
