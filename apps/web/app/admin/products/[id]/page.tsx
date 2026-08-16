'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Globe, PlusCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateCategoryModal } from '@/components/admin/create-category-modal';
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
  countryOfOrigin: '',
  productStatus: 'APPROVED' as ProductStatus,
  imageUrl: '',
  isActive: true,
  categoryId: '',
};

export default function AdminEditProductPage() {
  const router = useRouter();
  const { t, formatCategoryName } = useLanguage();
  const params = useParams<{ id: string }>();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [stage, setStage] = useState<1 | 2>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(initialForm);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!productId) {
      setMessage('Missing product id');
      setLoading(false);
      return;
    }

    Promise.all([api.adminCategories(), api.adminProductDetails(productId)])
      .then(([categoryRes, product]) => {
        setCategories(categoryRes);
        setForm({
          name: product.name,
          arabicName: product.arabicName ?? '',
          slug: product.slug,
          description: product.description,
          arabicDescription: product.arabicDescription ?? '',
          price: product.price,
          stockQuantity: product.stockQuantity,
          sku: product.sku ?? '',
          brand: product.brand ?? '',
          countryOfOrigin: product.countryOfOrigin ?? '',
          productStatus: product.productStatus ?? 'APPROVED',
          imageUrl: product.imageUrl,
          isActive: product.isActive,
          categoryId: product.categoryId ?? product.category.id,
        });
      })
      .catch((e: Error) => setMessage(e.message))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleCategoryCreated = (newCat: Category) => {
    setCategories((prev) => {
      if (prev.some((c) => c.id === newCat.id)) return prev;
      return [...prev, newCat];
    });
    setForm((prev) => ({ ...prev, categoryId: newCat.id }));
  };

  const submit = async () => {
    if (!productId) return;

    setSaving(true);
    setMessage(null);

    try {
      await api.adminUpdateProduct(productId, form);
      router.push('/admin/products?updated=1');
      router.refresh();
    } catch (e) {
      setMessage((e as Error).message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">
          {t('Loading product details...', 'جاري تحميل تفاصيل المنتج...')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Category Creation Modal */}
      <CreateCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={handleCategoryCreated}
      />

      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="serif-font text-3xl font-bold text-slate-800">
            {t('Edit Product', 'تعديل المنتج')}
          </h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
            {t('Update product specifications in English & Arabic', 'تعديل مواصفات وبيانات المنتج باللغتين الإنجليزية والعربية')}
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
          <span>{t('Stage 1: English Info & Specs', 'المرحلة 1: البيانات والمواصفات بالإنجليزية')}</span>
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
          <span>{t('Stage 2: Arabic Info & Localization', 'المرحلة 2: البيانات والترجمة باللغة العربية')}</span>
        </button>
      </div>

      {/* STAGE 1: ENGLISH DETAILS & SPECS */}
      {stage === 1 && (
        <div className="glass-card rounded-2xl p-6 border border-slate-200/60 bg-white space-y-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 text-sm">
              {t('Stage 1: English Name, Category, Price & Specifications', 'المرحلة 1: الاسم بالإنجليزية، الفئة، السعر والمواصفات الفنية')}
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label={t('Product Name (English)', 'اسم المنتج (باللغة الإنجليزية)')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              isRequired
            />

            <Input
              label={t('URL Slug', 'رابط المنتج (Slug)')}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
              isRequired
            />

            <Input
              label={t('Price (SAR)', 'السعر (ر.س)')}
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              required
              isRequired
            />

            <Input
              label={t('Stock Quantity', 'الكمية في المخزون')}
              type="number"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
              required
              isRequired
            />

            <Input
              label={t('SKU (Stock Keeping Unit)', 'رمز المنتج (SKU)')}
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="HL-SOL-550W"
            />

            <Input
              label={t('Brand / Manufacturer', 'الماركة / الشركة المصنعة')}
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="Half Link Energy"
            />

            <Input
              label={t('Image URL', 'رابط الصورة (Image URL)')}
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              required
              isRequired
            />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1 text-xs font-bold text-slate-700">
                  <span>{t('Category', 'الفئة والتصنيف')}</span>
                  <span className="text-rose-500 font-extrabold">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline transition cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{t('+ Add Category', '+ إضافة فئة جديدة')}</span>
                </button>
              </div>
              <select
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
              >
                <option value="">{t('Select Category', 'اختر الفئة')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {formatCategoryName(cat)} ({cat.name})
                  </option>
                ))}
              </select>
            </div>

            <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-700">
              {t('Product Status', 'حالة المنتج')}
              <select
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition"
                value={form.productStatus}
                onChange={(e) =>
                  setForm({
                    ...form,
                    productStatus: e.target.value as ProductStatus,
                  })
                }
              >
                <option value="APPROVED">{t('Approved for Sale (معتمد للبيع)', 'معتمد للبيع ومتاح بالمتجر')}</option>
                <option value="DRAFT">{t('Draft (مسودة)', 'مسودة')}</option>
                <option value="COMPLIANCE_REVIEW">{t('Technical / Quality Review (مراجعة الجودة والمواصفات)', 'قيد المراجعة الفنية والجودة')}</option>
                <option value="INACTIVE">{t('Inactive (غير نشط)', 'غير نشط')}</option>
              </select>
            </label>

            <Input
              label={t('Country of Origin', 'بلد الصنع / المنشأ')}
              value={form.countryOfOrigin}
              onChange={(e) => setForm({ ...form, countryOfOrigin: e.target.value })}
              placeholder="Saudi Arabia"
            />

            <div className="flex flex-col justify-center gap-2 pt-2 md:col-span-2">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>{t('Active Product (Visible on Storefront)', 'منتج نشط (يظهر بالمتجر للعملاء)')}</span>
              </label>
            </div>

            <label className="col-span-full flex flex-col gap-1.5 text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <span>{t('Description & Specifications (English)', 'الوصف والمواصفات باللغة الإنجليزية')}</span>
                <span className="text-rose-500 font-extrabold">*</span>
              </span>
              <textarea
                className="rounded-xl border border-slate-300 p-3.5 text-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                required
              />
            </label>
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
                {t('Stage 2: Arabic Name & Description', 'المرحلة 2: اسم المنتج والوصف والمواصفات باللغة العربية')}
              </h3>
            </div>

            <div className="space-y-5">
              <Input
                label={t('Arabic Product Name (اسم المنتج باللغة العربية)', 'اسم المنتج باللغة العربية')}
                value={form.arabicName}
                onChange={(e) => setForm({ ...form, arabicName: e.target.value })}
                placeholder="مثال: لوح طاقة شمسية مونوكريستال 550 واط عالي الكفاءة"
                required
                isRequired
              />

              <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-700">
                {t('Arabic Description (الوصف والمواصفات الفنية باللغة العربية)', 'الوصف والمواصفات الفنية باللغة العربية')}
                <textarea
                  className="rounded-xl border border-slate-300 p-3.5 text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                  value={form.arabicDescription}
                  onChange={(e) => setForm({ ...form, arabicDescription: e.target.value })}
                  rows={4}
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
                <span>{saving ? t('Saving...', 'جاري الحفظ...') : t('Save Changes', 'حفظ التعديلات')}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {message && <p className="text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">{message}</p>}
    </div>
  );
}
