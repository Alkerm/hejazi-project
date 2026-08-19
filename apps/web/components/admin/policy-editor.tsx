'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ScrollText,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Save,
  Check,
  ExternalLink,
  Eye,
  Edit3,
  Globe,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { StorePolicy, UpdateStorePolicyPayload } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const POLICY_TABS = [
  {
    slug: 'terms',
    labelEn: 'Terms & Conditions',
    labelAr: 'الشروط والأحكام',
    storeUrl: '/terms',
    icon: ScrollText,
    descAr: 'الشروط والضوابط القانونية والتجارية للطلب والأسعار والضريبة',
    descEn: 'Commercial & legal terms for orders, pricing, and taxation',
  },
  {
    slug: 'privacy',
    labelEn: 'Privacy Policy',
    labelAr: 'سياسة الخصوصية',
    storeUrl: '/privacy',
    icon: ShieldCheck,
    descAr: 'حماية البيانات الشخصية وفق نظام حماية البيانات السعودي (PDPL)',
    descEn: 'Personal data protection compliant with Saudi PDPL regulations',
  },
  {
    slug: 'shipping-delivery',
    labelEn: 'Shipping & Delivery',
    labelAr: 'الشحن والتوصيل',
    storeUrl: '/shipping-delivery',
    icon: Truck,
    descAr: 'المواعيد الزمنية للتوصيل، المدن المغطاة، وتتبع السائق المباشر',
    descEn: 'Delivery timelines, regional coverage, and live GPS tracking',
  },
  {
    slug: 'returns-refunds',
    labelEn: 'Returns, Refunds & Warranty',
    labelAr: 'الإرجاع والاستبدال والضمان',
    storeUrl: '/returns-refunds',
    icon: RotateCcw,
    descAr: 'ضوابط استرجاع المنتجات، شروط الضمان، وفترات استرداد الأموال',
    descEn: 'Return window (7 days), warranty coverage, and refund rules',
  },
  {
    slug: 'complaints-contact',
    labelEn: 'Complaints & Customer Care',
    labelAr: 'الشكاوى وخدمة العملاء',
    storeUrl: '/complaints-contact',
    icon: Headphones,
    descAr: 'قنوات التواصل، استقبال الشكاوى، ومهل المعالجة والتصعيد',
    descEn: 'Support tickets, complaint resolution SLAs, and escalation',
  },
];

interface PolicyEditorProps {
  currentSlug?: string;
}

export function PolicyEditor({ currentSlug = 'terms' }: PolicyEditorProps) {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [activeSlug, setActiveSlug] = useState(currentSlug);
  const [policy, setPolicy] = useState<StorePolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Active edit language tab: 'ar' | 'en' | 'preview'
  const [editorTab, setEditorTab] = useState<'ar' | 'en' | 'preview'>('ar');

  // Form State
  const [form, setForm] = useState<UpdateStorePolicyPayload>({
    titleEn: '',
    titleAr: '',
    summaryEn: '',
    summaryAr: '',
    contentEn: '',
    contentAr: '',
  });

  const loadPolicy = async (slug: string) => {
    setLoading(true);
    try {
      const data = await api.getPolicyBySlug(slug);
      setPolicy(data);
      setForm({
        titleEn: data.titleEn || '',
        titleAr: data.titleAr || '',
        summaryEn: data.summaryEn || '',
        summaryAr: data.summaryAr || '',
        contentEn: data.contentEn || '',
        contentAr: data.contentAr || '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to load policy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveSlug(currentSlug);
    loadPolicy(currentSlug);
  }, [currentSlug]);

  const handleTabChange = (slug: string) => {
    setActiveSlug(slug);
    router.push(`/admin/policies/${slug}`);
  };

  const handleSave = async () => {
    if (!form.titleAr.trim() || !form.titleEn.trim()) {
      toast.error(t('Please provide titles in both Arabic and English', 'يرجى إدخال العنوان بالعربية والإنجليزية'));
      return;
    }

    if (!form.contentAr.trim() || !form.contentEn.trim()) {
      toast.error(t('Please provide content in both Arabic and English', 'يرجى إدخال محتوى السياسة بالعربية والإنجليزية'));
      return;
    }

    setSaving(true);
    try {
      const updated = await api.adminUpdatePolicy(activeSlug, form);
      setPolicy(updated);
      toast.success(
        t('Policy changes saved and live on storefront!', 'تم حفظ تعديلات السياسة ونشرها في المتجر بنجاح!')
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to save policy');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        t(
          'Are you sure you want to reset this policy to the official compliant template? Any custom wording will be replaced.',
          'هل أنت متأكد من رغبتك في استعادة النص النموذجي المعتمد لهذه السياسة؟ سيتم استبدال أي نصوص مخصصة.'
        )
      )
    ) {
      return;
    }

    setResetting(true);
    try {
      const resetData = await api.adminResetPolicy(activeSlug);
      setPolicy(resetData);
      setForm({
        titleEn: resetData.titleEn,
        titleAr: resetData.titleAr,
        summaryEn: resetData.summaryEn || '',
        summaryAr: resetData.summaryAr || '',
        contentEn: resetData.contentEn,
        contentAr: resetData.contentAr,
      });
      toast.success(
        t('Policy reset to default compliant template!', 'تمت استعادة النص النموذجي المعتمد للسياسة بنجاح!')
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset policy');
    } finally {
      setResetting(false);
    }
  };

  const activeTabMeta = POLICY_TABS.find((p) => p.slug === activeSlug) ?? POLICY_TABS[0]!;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-fade-in">
      <Toaster position="top-center" richColors />

      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/70 bg-gradient-to-br from-white via-white to-slate-50/50 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-sm">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {t('Store Policies & Legal Management', 'إدارة سياسات المتجر والمحتوى القانوني')}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'Edit, customize, and publish store policies in Arabic and English with instant live storefront updates.',
                  'تعديل وتخصيص ونشر سياسات المتجر بالعربية والإنجليزية مع التحديث المباشر والفوري لصفحات المتجر.'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={activeTabMeta.storeUrl}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-2xs"
          >
            <span>{t('View on Storefront', 'معاينة في المتجر')}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? t('Saving...', 'جاري الحفظ...') : t('Save Policy', 'حفظ التعديلات')}</span>
          </Button>
        </div>
      </div>

      {/* 5 Policy Option Buttons / Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {POLICY_TABS.map((item) => {
          const Icon = item.icon;
          const isCurrent = item.slug === activeSlug;
          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => handleTabChange(item.slug)}
              className={`text-left rtl:text-right p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isCurrent
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-[1.02]'
                  : 'bg-white border-slate-200/80 text-slate-800 hover:border-amber-400/80 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`p-2 rounded-xl ${
                    isCurrent ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isCurrent && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full">
                    {t('Active', 'محدد')}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <h3 className={`text-xs font-black line-clamp-1 ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                  {lang === 'ar' ? item.labelAr : item.labelEn}
                </h3>
                <p className={`text-[10px] mt-0.5 line-clamp-1 ${isCurrent ? 'text-slate-400' : 'text-slate-500'}`}>
                  {lang === 'ar' ? item.descAr : item.descEn}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Editor Card */}
      <div className="glass-card rounded-3xl border border-slate-200/70 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Editor Controls Subheader */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setEditorTab('ar')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                  editorTab === 'ar'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🇸🇦 {t('Arabic Content', 'المحتوى بالعربية')}</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorTab('en')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                  editorTab === 'en'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🇬🇧 {t('English Content', 'المحتوى بالإنجليزية')}</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorTab('preview')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                  editorTab === 'preview'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{t('Live Preview', 'معاينة حية')}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={resetting || loading}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? t('Resetting...', 'جاري الاستعادة...') : t('Reset to Compliant Default', 'استعادة النص النموذجي')}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500"></div>
            <p className="text-xs font-semibold text-slate-500">{t('Loading policy content...', 'جاري تحميل محتوى السياسة...')}</p>
          </div>
        ) : editorTab === 'ar' ? (
          /* Arabic Form Fields */
          <div className="space-y-5">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>{t('Arabic Storefront Display:', 'العرض باللغة العربية في المتجر:')}</strong>{' '}
                {t(
                  'This text is displayed when the store is viewed in Arabic and for official local compliance.',
                  'يتم عرض هذا النص عند تصفح المتجر باللغة العربية ولأغراض الامتثال التجاري المحلي.'
                )}
              </div>
            </div>

            <div>
              <Input
                label={t('Policy Title (Arabic) - عنوان السياسة', 'عنوان السياسة (باللغة العربية)')}
                value={form.titleAr}
                onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                placeholder="مثال: الشروط والأحكام"
                required
                isRequired
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('Summary / Subtitle (Arabic) - ملخص ومقدمة السياسة', 'ملخص ومقدمة السياسة (باللغة العربية)')}
              </label>
              <textarea
                value={form.summaryAr || ''}
                onChange={(e) => setForm({ ...form, summaryAr: e.target.value })}
                rows={2}
                placeholder="مقدمة مختصرة تظهر أعلى الصفحة لتوضيح أهداف السياسة للعميل..."
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('Full Policy Content (Arabic) - نص ومواد السياسة الكاملة', 'نص ومواد السياسة الكاملة (باللغة العربية)')}
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                {t('Supports markdown headings (### 1. Title), bullet lists (- item), and bold text (**text**).', 'يدعم العناوين (### ١. العنوان)، القوائم النقطية (- بند)، والنصوص العريضة (**نص**).')}
              </p>
              <textarea
                value={form.contentAr}
                onChange={(e) => setForm({ ...form, contentAr: e.target.value })}
                rows={16}
                placeholder="اكتب نصوص ومواد السياسة هنا..."
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 font-mono leading-relaxed"
                required
              />
            </div>
          </div>
        ) : editorTab === 'en' ? (
          /* English Form Fields */
          <div className="space-y-5">
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-2.5">
              <Globe className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>{t('English Storefront Display:', 'العرض باللغة الإنجليزية في المتجر:')}</strong>{' '}
                {t(
                  'This text is displayed when international or English-speaking customers browse the storefront.',
                  'يتم عرض هذا النص عند تصفح العملاء للمتجر باللغة الإنجليزية.'
                )}
              </div>
            </div>

            <div>
              <Input
                label={t('Policy Title (English)', 'عنوان السياسة (باللغة الإنجليزية)')}
                value={form.titleEn}
                onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                placeholder="e.g. Terms & Conditions"
                required
                isRequired
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('Summary / Subtitle (English)', 'ملخص ومقدمة السياسة (باللغة الإنجليزية)')}
              </label>
              <textarea
                value={form.summaryEn || ''}
                onChange={(e) => setForm({ ...form, summaryEn: e.target.value })}
                rows={2}
                placeholder="Brief summary introducing the policy to English-speaking customers..."
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('Full Policy Content (English)', 'نص ومواد السياسة الكاملة (باللغة الإنجليزية)')}
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                {t('Supports markdown headings (### 1. Title), bullet lists (- item), and bold text (**text**).', 'يدعم العناوين (### 1. Title)، القوائم النقطية (- item)، والنصوص العريضة (**text**).')}
              </p>
              <textarea
                value={form.contentEn}
                onChange={(e) => setForm({ ...form, contentEn: e.target.value })}
                rows={16}
                placeholder="Write the full English policy content here..."
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 font-mono leading-relaxed"
                required
              />
            </div>
          </div>
        ) : (
          /* Live Storefront Preview Simulator */
          <div className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('Simulated Customer Storefront View', 'محاكاة صفحة العرض المباشر للعميل')}</span>
              </span>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {activeTabMeta.storeUrl}
              </span>
            </div>

            {/* Arabic Preview */}
            <div className="space-y-4 rounded-2xl bg-white p-6 border border-slate-200 text-right" dir="rtl">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">سياسة معتمدة رسمياً</span>
                <h2 className="text-2xl font-black text-slate-900">{form.titleAr || 'عنوان السياسة'}</h2>
                {form.summaryAr && <p className="text-xs text-slate-600 leading-relaxed">{form.summaryAr}</p>}
              </div>
              <div className="whitespace-pre-line text-xs text-slate-700 leading-relaxed font-sans">
                {form.contentAr || 'لا يوجد محتوى'}
              </div>
            </div>

            {/* English Preview */}
            <div className="space-y-4 rounded-2xl bg-white p-6 border border-slate-200 text-left" dir="ltr">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Official Store Policy</span>
                <h2 className="text-2xl font-black text-slate-900">{form.titleEn || 'Policy Title'}</h2>
                {form.summaryEn && <p className="text-xs text-slate-600 leading-relaxed">{form.summaryEn}</p>}
              </div>
              <div className="whitespace-pre-line text-xs text-slate-700 leading-relaxed font-sans">
                {form.contentEn || 'No content provided'}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {policy?.updatedAt && (
              <span>
                {t('Last updated on:', 'آخر تحديث:')}{' '}
                <strong className="text-slate-700">{new Date(policy.updatedAt).toLocaleString()}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? t('Publishing Changes...', 'جاري النشر...') : t('Publish & Save Policy', 'نشر وحفظ التعديلات')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
