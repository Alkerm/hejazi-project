'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Truck, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatMoney } from '@/lib/format';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { PaymentSelector, PaymentMethod } from '@/components/store/payment-selector';
import { PaymentForm } from '@/components/store/payment-form';

export default function OrderPaymentPage() {
  const { t, lang } = useLanguage();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    (searchParams.get('method') as PaymentMethod) || 'MADA'
  );

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    api
      .myOrderDetails(params.id)
      .then((data) => {
        setOrder(data);
        if (data.paymentStatus === 'PAID') {
          router.replace(`/orders/${data.id}/success`);
        }
      })
      .catch((err: Error) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const handlePaymentSuccess = (updatedOrder: Order) => {
    toast.success(t('Payment completed successfully!', 'تمت عملية الدفع بنجاح!'));
    router.push(`/orders/${updatedOrder.id}/success`);
  };

  const handlePaymentFailure = (errorMessage: string) => {
    toast.error(errorMessage);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Toaster position="top-right" richColors />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500"></div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
          {t('Loading Payment Session...', 'جاري تحميل جلسة الدفع...')}
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-24 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">{t('Order Not Found', 'الطلب غير موجود')}</h2>
        <Link href="/orders">
          <Button variant="secondary" className="text-xs">{t('Return to Orders', 'العودة إلى الطلبات')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-8 animate-fade-in">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              {t('Step 2 of 2: Payment', 'الخطوة 2 من 2: الدفع')}
            </span>
          </div>
          <h1 className="serif-font text-2xl sm:text-3xl font-black text-slate-900">
            {t('Complete Your Order Payment', 'استكمال سداد الطلب')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('Order Reference:', 'رقم مرجع الطلب:')} <strong className="text-slate-800">#{order.id.slice(-8).toUpperCase()}</strong>
          </p>
        </div>

        <Link href="/cart">
          <Button variant="secondary" className="border-slate-200 text-xs flex items-center gap-1.5 font-bold rounded-xl py-2 px-3.5 shadow-2xs hover:bg-slate-100">
            <ArrowLeft className={`w-3.5 h-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`} /> {t('Return to Cart', 'العودة إلى السلة')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Payment Selector & Interactive Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/60 bg-white shadow-xs space-y-6">
            <PaymentSelector selectedMethod={selectedMethod} onSelectMethod={setSelectedMethod} />

            <div className="border-t border-slate-100 pt-6">
              <PaymentForm
                orderId={order.id}
                orderTotal={order.total}
                currency={order.currency}
                selectedMethod={selectedMethod}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailure={handlePaymentFailure}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Items Summary & VAT Breakdown */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-card rounded-3xl p-6 border border-slate-200/60 bg-white shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                {t('Order Items', 'منتجات الطلب')} ({order.items.length})
              </h2>
              <span className="text-xs font-bold text-slate-500">#{order.id.slice(-6).toUpperCase()}</span>
            </div>

            {/* Item list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 space-y-3 pr-1">
              {order.items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-amber-700 text-sm overflow-hidden flex-none border border-slate-200/50">
                      {item.productNameSnapshot.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 line-clamp-1">{item.productNameSnapshot}</h4>
                      <p className="text-[11px] text-slate-400">
                        {item.quantity} × {formatMoney(item.unitPriceSnapshot)}
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-slate-800 flex-none">{formatMoney(item.lineTotal)}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations & Tax */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>{t('Subtotal', 'المجموع الفرعي')}</span>
                <span className="font-semibold text-slate-700">{formatMoney(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{t('Shipping & Delivery', 'الشحن والتوصيل')}</span>
                <span className="font-semibold text-slate-700">
                  {order.shippingAmount === 0 ? t('Free', 'مجاني') : formatMoney(order.shippingAmount)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{t('VAT (15%)', 'ضريبة القيمة المضافة (15%)')}</span>
                <span className="font-semibold text-slate-700">{formatMoney(order.vatAmount)}</span>
              </div>
              <div className="border-t border-slate-200/60 pt-3 flex justify-between text-sm font-black text-slate-900">
                <span>{t('Total Amount Due', 'الإجمالي المطلوب')}</span>
                <span className="text-base text-amber-600 font-black">{formatMoney(order.total)} {order.currency}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address Confirmation */}
          <div className="glass-card rounded-3xl p-5 border border-slate-200/60 bg-white space-y-2 text-xs">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              {t('Shipping Destination', 'وجهة الشحن')}
            </h3>
            <p className="text-slate-600 font-light leading-relaxed">
              {order.shippingAddressSnapshot.line1}
              {order.shippingAddressSnapshot.line2 && `, ${order.shippingAddressSnapshot.line2}`}
              <br />
              {order.shippingAddressSnapshot.city}, {order.shippingAddressSnapshot.country} {order.shippingAddressSnapshot.postalCode}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
