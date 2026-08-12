'use client';

import React, { useEffect, useState } from 'react';
import { Tag, Plus, CheckCircle, XCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { Coupon } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';

export default function AdminCouponsPage() {
  const { t } = useLanguage();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(20);
  const [minOrderAmount, setMinOrderAmount] = useState<number | undefined>(undefined);
  const [creating, setCreating] = useState(false);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await api.adminCoupons();
      setCoupons(data);
    } catch (err: any) {
      toast.error(err.message || t('Failed to load coupons', 'فشل تحميل الكوبونات'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setCreating(true);

    try {
      await api.adminCreateCoupon({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
      });

      toast.success(t(`Coupon "${code.toUpperCase()}" created successfully!`, `تم إنشاء كوبون التخفيض "${code.toUpperCase()}" بنجاح!`));
      setCode('');
      setShowModal(false);
      await loadCoupons();
    } catch (err: any) {
      toast.error(err.message || t('Failed to create coupon', 'فشل إنشاء الكوبون'));
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await api.adminToggleCoupon(id, isActive);
      toast.success(isActive ? t('Coupon activated', 'تم تفعيل الكوبون') : t('Coupon deactivated', 'تم إلغاء تفعيل الكوبون'));
      await loadCoupons();
    } catch (err: any) {
      toast.error(err.message || t('Failed to update coupon status', 'فشل تغيير حالة الكوبون'));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Toaster position="top-right" richColors />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">
          {t('Loading coupons...', 'جاري تحميل الكوبونات...')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <Toaster position="top-right" richColors />

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/50 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Tag className="w-6 h-6 text-slate-800" />
            <h1 className="serif-font text-3xl font-bold text-slate-800">
              {t('Promotional Coupons & Discounts', 'كوبونات الخصم والعروض الترويجية')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            {t('Manage store promotional codes and discount offers', 'إدارة أكواد الخصم والعروض الترويجية للمتجر')}
          </p>
        </div>

        <Button onClick={() => setShowModal(true)} className="bg-slate-900 text-white text-xs flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t('Create Coupon', 'إضافة كوبون جديد')}
        </Button>
      </div>

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800">
              {t('Create New Coupon Code', 'إنشاء كود خصم جديد')}
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {t('Coupon Code:', 'كود الخصم:')}
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="HEJAZI20"
                  className="w-full p-2.5 rounded-xl border border-slate-200 uppercase font-bold text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {t('Discount Type:', 'نوع الخصم:')}
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="PERCENTAGE">{t('Percentage (%)', 'نسبة مئوية (%)')}</option>
                    <option value="FIXED_AMOUNT">{t('Fixed SAR Amount', 'مبلغ ثابت (ر.س)')}</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {t('Discount Value:', 'قيمة الخصم:')}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {t('Minimum Order Subtotal (SAR, optional):', 'الحد الأدنى للطلب (ر.س، اختياري):')}
                </label>
                <input
                  type="number"
                  min="0"
                  value={minOrderAmount || ''}
                  onChange={(e) => setMinOrderAmount(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="100"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  {t('Cancel', 'إلغاء')}
                </Button>
                <Button type="submit" disabled={creating} className="bg-slate-900 text-white font-bold">
                  {creating ? t('Creating...', 'جاري الحفظ...') : t('Save Coupon', 'حفظ الكوبون')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-12 text-center text-slate-500 text-sm">
          {t('No promotional coupons created yet. Click "Create Coupon" to start.', 'لا توجد كوبونات خصم حالياً. اضغط "إضافة كوبون جديد" للبدء.')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((c) => (
            <div key={c.id} className="glass-card rounded-2xl p-5 border border-slate-200/40 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-slate-800 tracking-wider uppercase bg-slate-100 px-3 py-1 rounded-xl">
                    {c.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {c.isActive ? t('Active', 'مفعل') : t('Inactive', 'غير مفعل')}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <strong className="text-slate-700">{t('Discount:', 'مقدار الخصم:')}</strong>{' '}
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% ${t('OFF', 'خصم')}` : `${c.discountValue} ${t('SAR OFF', 'ر.س خصم')}`}
                  </p>
                  {c.minOrderAmount && (
                    <p><strong className="text-slate-700">{t('Min Order:', 'الحد الأدنى للطلب:')}</strong> {c.minOrderAmount} {t('SAR', 'ر.س')}</p>
                  )}
                  <p><strong className="text-slate-700">{t('Times Used:', 'عدد مرات الاستخدام:')}</strong> {c.usedCount} {t('times', 'مرة')}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                {c.isActive ? (
                  <Button
                    onClick={() => handleToggleActive(c.id, false)}
                    variant="secondary"
                    className="w-full text-xs border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" /> {t('Deactivate Code', 'إيقاف الكوبون')}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleToggleActive(c.id, true)}
                    className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> {t('Activate Code', 'تفعيل الكوبون')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
