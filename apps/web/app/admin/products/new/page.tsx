'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Globe, FileText, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/language-context';

type ProductStatus = 'DRAFT' | 'COMPLIANCE_REVIEW' | 'APPROVED' | 'INACTIVE';

const initialForm = {
  name: '',
  arabicName: '',
  slug: '',
  description: '',
  arabicDescription: '',
  price: 0,
  stockQuantity: 0,
  sku: '',
  brand: '',
  ingredients: '',
  warnings: '',
  usageInstructions: '',
  countryOfOrigin: '',
  manufacturer: '',
  importerResponsible: '',
  sfdaReference: '',
  batchNumberRequired: false,
  expiryDateRequired: false,
  productStatus: 'DRAFT' as ProductStatus,
  imageUrl: '',
  isActive: true,
  categoryId: '',
};

export default function AdminCreateProductPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [stage, setStage] = useState<1 | 2>(1);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .adminCategories()
      .then((res) => setCategories(res.map((c) => ({ id: c.id, name: c.name }))))
      .catch((e: Error) => setMessage(e.message));
  }, []);

  const handleNameChange = (val: string) => {
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setForm((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug || generatedSlug,
    }));
  };

  const submit = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await api.adminCreateProduct(form);
      router.push('/admin/products?created=1');
      router.refresh();
    } catch (e) {
      setMessage((e as Error).message);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="serif-font text-3xl font-bold text-slate-800">
            {t('Create New Product', 'إضافة منتج جديد')}
          </h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
            {t('Two-stage product creation workflow', 'إضافة المنتج عبر مرحلتين (الإنجليزية ثم العربية)')}
          </p>
        </div>
      </div>

      {/* Stage Wizard Progress Steps */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setStage(1)}
          className={`flex items-center justify-center gap-2.5 py-3 rounded-xl text-xs font-bold transition-all ${
            stage === 1
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] text-slate-950 font-extrabold">
            1
          </span>
          <span>{t('Stage 1: English Info & Details', 'المرحلة 1: البيانات بالإنجليزية والأسعار')}</span>
        </button>

        <button
          type="button"
          onClick={() => setStage(2)}
          className={`flex items-center justify-center gap-2.5 py-3 rounded-xl text-xs font-bold transition-all ${
            stage === 2
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-slate-950 font-extrabold">
            2
          </span>
          <span>{t('Stage 2: Arabic Info & Localization', 'المرحلة 2: البيانات باللغة العربية والترجمة')}</span>
        </button>
      </div>

      {/* STAGE 1: ENGLISH DETAILS & INVENTORY */}
      {stage === 1 && (
        <div className="glass-card rounded-2xl p-6 border border-slate-200/60 bg-white space-y-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 text-sm">
              {t('Stage 1: English Name, Category, Price & Details', 'المرحلة 1: الاسم بالإنجليزية، الفئة، السعر والمواصفات')}
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label={t('Product Name (English)', 'اسم المنتج (باللغة الإنجليزية)')}
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Royal Argan Youth Serum"
              required
            />

            <Input
              label={t('URL Slug', 'رابط المنتج (Slug)')}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="royal-argan-youth-serum"
              required
            />

            <Input
              label={t('Price (SAR)', 'السعر (ر.س)')}
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              required
            />

            <Input
              label={t('Stock Quantity', 'الكمية في المخزون')}
              type="number"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
              required
            />

            <Input
              label={t('SKU', 'رمز المنتج (SKU)')}
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="HJ-SRM-001"
            />

            <Input
              label={t('Brand Name', 'اسم الماركة / العلامة التجارية')}
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="Hejazi Luxury"
            />

            <Input
              label={t('Image URL', 'رابط الصورة (Image URL)')}
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              required
            />

            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
              {t('Category', 'الفئة')}
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs focus:ring-2 focus:ring-amber-500/20"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">{t('Select Category', 'اختر الفئة')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
              {t('Product Status', 'حالة المنتج')}
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs focus:ring-2 focus:ring-amber-500/20"
                value={form.productStatus}
                onChange={(e) =>
                  setForm({
                    ...form,
                    productStatus: e.target.value as ProductStatus,
                  })
                }
              >
                <option value="DRAFT">{t('Draft', 'مسودة')}</option>
                <option value="COMPLIANCE_REVIEW">{t('Compliance Review', 'قيد مراجعة الغذاء والدواء')}</option>
                <option value="APPROVED">{t('Approved for Sale', 'معتمد للبيع')}</option>
                <option value="INACTIVE">{t('Inactive', 'غير نشط')}</option>
              </select>
            </label>

            <div className="flex flex-col justify-center gap-2 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                {t('Active Product (Visible on Storefront)', 'منتج نشط (يظهر بالمتجر)')}
              </label>
            </div>

            <label className="col-span-full flex flex-col gap-1 text-xs font-semibold text-slate-700">
              {t('Description (English)', 'الوصف باللغة الإنجليزية')}
              <textarea
                className="rounded-xl border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-amber-500/20"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Detailed English description of product features and benefits..."
              />
            </label>

            <label className="col-span-full flex flex-col gap-1 text-xs font-semibold text-slate-700">
              {t('Full Ingredients (English/Formula)', 'المكونات الكاملة')}
              <textarea
                className="rounded-xl border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-amber-500/20"
                value={form.ingredients}
                onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                rows={2}
                placeholder="Organic Argan Oil, Hyaluronic Acid, Vitamin E..."
              />
            </label>

            <Input
              label={t('SFDA Reference Number', 'رقم التسجيل بهيئة الغذاء والدواء (SFDA)')}
              value={form.sfdaReference}
              onChange={(e) => setForm({ ...form, sfdaReference: e.target.value })}
              placeholder="SFDA-COS-2026-9812"
            />

            <Input
              label={t('Country of Origin', 'بلد الصنع / المنشأ')}
              value={form.countryOfOrigin}
              onChange={(e) => setForm({ ...form, countryOfOrigin: e.target.value })}
              placeholder="Saudi Arabia"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button variant="secondary" onClick={() => router.push('/admin/products')}>
              {t('Cancel', 'إلغاء')}
            </Button>

            <Button
              type="button"
              onClick={() => setStage(2)}
              className="bg-slate-900 text-white font-bold flex items-center gap-2 px-6 py-2.5 text-xs rounded-xl shadow-md"
            >
              <span>{t('Proceed to Stage 2: Arabic Info', 'الانتقال للمرحلة 2: البيانات بالعربية')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      )}

      {/* STAGE 2: ARABIC LOCALIZATION */}
      {stage === 2 && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-200/60 bg-white space-y-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-slate-800 text-sm">
                {t('Stage 2: Arabic Name & Description', 'المرحلة 2: اسم المنتج والوصف باللغة العربية')}
              </h3>
            </div>

            <div className="space-y-5">
              <Input
                label={t('Arabic Product Name (اسم المنتج باللغة العربية)', 'اسم المنتج باللغة العربية')}
                value={form.arabicName}
                onChange={(e) => setForm({ ...form, arabicName: e.target.value })}
                placeholder="مثال: سيروم الأرغان الملكي لتجديد البشرة"
                required
              />

              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
                {t('Arabic Description (وصف المنتج باللغة العربية)', 'الوصف والتعليمات باللغة العربية')}
                <textarea
                  className="rounded-xl border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-emerald-500/20"
                  value={form.arabicDescription}
                  onChange={(e) => setForm({ ...form, arabicDescription: e.target.value })}
                  rows={4}
                  placeholder="سيروم فاخر يحتوي على خلاصات الأرغان العضوية وزيوت حمض الهيالورونيك لنضارة فائقة..."
                />
              </label>

              {/* Preview Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                  {t('Product Bilingual Card Preview', 'معاينة بطاقة المنتج قبل الحفظ')}
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">English View</span>
                    <p className="font-bold text-xs text-slate-800">{form.name || '(English Name)'}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{form.description || '(English Description)'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1" dir="rtl">
                    <span className="text-[9px] font-bold text-emerald-600 uppercase">العرض بالعربية</span>
                    <p className="font-bold text-xs text-slate-800">{form.arabicName || form.name || '(الاسم بالعربية)'}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{form.arabicDescription || form.description || '(الوصف بالعربية)'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStage(1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{t('Back to Stage 1: English Info', 'العودة للمرحلة 1: البيانات بالإنجليزية')}</span>
              </Button>

              <Button
                type="button"
                onClick={submit}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 px-6 py-2.5 text-xs rounded-xl shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{saving ? t('Saving...', 'جاري الحفظ...') : t('Save & Publish Product', 'حفظ ونشر المنتج')}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {message && <p className="text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">{message}</p>}
    </div>
  );
}
