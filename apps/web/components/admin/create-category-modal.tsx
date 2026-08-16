'use client';

import React, { useState, FormEvent } from 'react';
import { X, FolderPlus, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCategory: Category) => void;
}

export function CreateCategoryModal({ isOpen, onClose, onSuccess }: Props) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [arabicName, setArabicName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugModified, setSlugModified] = useState(false);

  const [errors, setErrors] = useState<{ name?: string; arabicName?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; arabicName?: boolean }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugModified) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(autoSlug);
    }
    if (touched.name) {
      setErrors((prev) => ({
        ...prev,
        name: val.trim() ? undefined : t('English name is required', 'اسم الفئة بالإنجليزية مطلوب'),
      }));
    }
  };

  const handleArabicNameChange = (val: string) => {
    setArabicName(val);
    if (touched.arabicName) {
      setErrors((prev) => ({
        ...prev,
        arabicName: val.trim() ? undefined : t('Arabic name is required', 'اسم الفئة بالعربية مطلوب'),
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const nameTrimmed = name.trim();
    const arabicTrimmed = arabicName.trim();

    const nameErr = nameTrimmed ? undefined : t('English category name is required', 'اسم الفئة باللغة الإنجليزية مطلوب');
    const arabicErr = arabicTrimmed ? undefined : t('Arabic category name is required', 'اسم الفئة باللغة العربية مطلوب');

    setTouched({ name: true, arabicName: true });
    setErrors({ name: nameErr, arabicName: arabicErr });

    if (nameErr || arabicErr) {
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      const generatedSlug =
        slug.trim() ||
        nameTrimmed
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

      const newCategory = await api.adminCreateCategory({
        name: nameTrimmed,
        arabicName: arabicTrimmed,
        slug: generatedSlug,
      });

      // Reset form
      setName('');
      setArabicName('');
      setSlug('');
      setSlugModified(false);
      setErrors({});
      setTouched({});

      onSuccess(newCategory);
      onClose();
    } catch (err: any) {
      setApiError(err.message || t('Failed to create category', 'فشل إنشاء الفئة'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/80 space-y-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {t('Add New Category', 'إضافة تصنيف / فئة جديدة')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t('Enter category name in English and Arabic', 'أدخل اسم الفئة باللغتين الإنجليزية والعربية')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API Error Message */}
        {apiError && (
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <p>{apiError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('Category Name (English)', 'اسم الفئة (باللغة الإنجليزية)')}
            placeholder="e.g. Inverters & Converters"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
            required
            isRequired
            error={touched.name ? errors.name : undefined}
            autoFocus
          />

          <Input
            label={t('Category Name (Arabic)', 'اسم الفئة (باللغة العربية)')}
            placeholder="مثال: محولات الطاقة والإنفرتر"
            value={arabicName}
            onChange={(e) => handleArabicNameChange(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, arabicName: true }))}
            required
            isRequired
            error={touched.arabicName ? errors.arabicName : undefined}
          />

          <Input
            label={t('URL Slug (Optional)', 'رابط الفئة (Slug - اختياري)')}
            placeholder="inverters-converters"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugModified(true);
            }}
            helperText={t('Alphanumeric characters and hyphens only', 'أحرف إنجليزية وأرقام وفواصل شرطية فقط')}
          />

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              {t('Cancel', 'إلغاء')}
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-1.5 text-xs shadow-md shadow-amber-500/20"
            >
              {loading ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{t('Creating...', 'جاري الإضافة...')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('Create Category', 'إضافة الفئة')}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
