'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { storefrontSettings } from '@/lib/storefront';

export function PolicyPageTemplate({
  title,
  summary,
  sections,
}: {
  title: string;
  summary: string;
  sections: Array<{ heading: string; body: string }>;
}) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Template</p>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600">{summary}</p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <section key={section.heading} className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-900">{section.heading}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
        Replace each placeholder with the approved business/legal wording for {storefrontSettings.storeName}.
      </div>
    </div>
  );
}
