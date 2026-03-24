import { PolicyPageTemplate } from '@/components/store/policy-page';
import { storefrontSettings } from '@/lib/storefront';

export default function ComplaintsContactPage() {
  return (
    <PolicyPageTemplate
      title="Complaints / Contact"
      summary="Template page for customer support, complaint escalation, and order issue reporting."
      sections={[
        {
          heading: 'How to Reach Us',
          body: `Email: ${storefrontSettings.email}\nPhone: ${storefrontSettings.phone}\nAddress: ${storefrontSettings.address}`,
        },
        {
          heading: 'Order Issues',
          body:
            'TODO: Explain how customers can report delivery issues, missing items, damaged goods, or payment concerns, including required order information.',
        },
        {
          heading: 'Complaint Handling',
          body:
            'TODO: Provide the expected response timeline, escalation route, and any complaint reference or ticket process used by the store.',
        },
        {
          heading: 'Business Information',
          body:
            'TODO: Confirm the legal name, Commercial Registration number, and any regulator-facing merchant information shown to customers.',
        },
      ]}
    />
  );
}
