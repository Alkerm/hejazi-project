'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShieldCheck, ScrollText, Calendar, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { StorePolicy } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';

interface PolicyPageTemplateProps {
  slug: string;
  fallbackTitleEn?: string;
  fallbackTitleAr?: string;
  fallbackSummaryEn?: string;
  fallbackSummaryAr?: string;
  fallbackContentEn?: string;
  fallbackContentAr?: string;
}

export function PolicyPageTemplate({
  slug,
  fallbackTitleEn = 'Store Policy',
  fallbackTitleAr = 'سياسة المتجر',
  fallbackSummaryEn,
  fallbackSummaryAr,
  fallbackContentEn,
  fallbackContentAr,
}: PolicyPageTemplateProps) {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [policy, setPolicy] = useState<StorePolicy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPolicyBySlug(slug)
      .then((data) => setPolicy(data))
      .catch(() => {
        // use fallbacks gracefully
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const isAr = lang === 'ar';

  const title = isAr
    ? policy?.titleAr || fallbackTitleAr
    : policy?.titleEn || fallbackTitleEn;

  const summary = isAr
    ? policy?.summaryAr || fallbackSummaryAr
    : policy?.summaryEn || fallbackSummaryEn;

  const content = isAr
    ? policy?.contentAr || fallbackContentAr || ''
    : policy?.contentEn || fallbackContentEn || '';

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-fade-in pb-16">
      {/* Back Button */}
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl transition shadow-2xs cursor-pointer"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t('Back', 'رجوع')}</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-amber-50/20 p-6 sm:p-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('Official Store Policy', 'سياسة المتجر الرسمية المعتمدة')}</span>
          </span>
        </div>

        <h1 className="serif-font text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
          {title}
        </h1>

        {summary && (
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            {summary}
          </p>
        )}

        {policy?.updatedAt && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <span>
              {t('Last updated:', 'آخر تحديث معتمد:')}{' '}
              <strong className="text-slate-800 font-semibold">{new Date(policy.updatedAt).toLocaleDateString()}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Main Content Body */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500"></div>
            <p className="text-xs text-slate-400 animate-pulse">{t('Loading policy...', 'جاري تحميل نص السياسة...')}</p>
          </div>
        ) : (
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm whitespace-pre-line space-y-4 font-sans">
            {content}
          </div>
        )}
      </div>

      {/* Trust & Support Footer Card */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-black text-slate-900">
            {t('Have questions about our store policies?', 'هل لديك أي استفسار حول سياسات المتجر؟')}
          </h4>
          <p className="text-xs text-slate-500">
            {t('Our customer care team is here to assist you 7 days a week.', 'فريق خدمة العملاء جاهز للإجابة على كافة استفساراتك على مدار الأسبوع.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/complaints-contact">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm cursor-pointer">
              <span>{t('Contact Customer Care', 'تواصل مع خدمة العملاء')}</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
