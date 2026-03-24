import { PolicyPageTemplate } from '@/components/store/policy-page';

export default function ShippingDeliveryPage() {
  return (
    <PolicyPageTemplate
      title="Shipping & Delivery Policy"
      summary="Template page for shipping fees, delivery expectations, and fulfillment responsibilities."
      sections={[
        {
          heading: 'Shipping Coverage',
          body:
            'TODO: List the countries or regions served, any restricted destinations, and whether delivery timelines vary by city or carrier.',
        },
        {
          heading: 'Fees and VAT',
          body:
            'TODO: Explain shipping charges, whether VAT is included in displayed pricing, and how costs appear at checkout.',
        },
        {
          heading: 'Delivery Timelines',
          body:
            'TODO: Provide standard delivery estimates, processing cut-off times, and factors that may delay dispatch or arrival.',
        },
        {
          heading: 'Customer Responsibilities',
          body:
            'TODO: Clarify the need for accurate shipping details, availability at delivery, and what happens if a shipment is undeliverable.',
        },
      ]}
    />
  );
}
