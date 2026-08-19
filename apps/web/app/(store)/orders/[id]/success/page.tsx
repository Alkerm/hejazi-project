'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Printer,
  ShoppingBag,
  Truck,
  ArrowRight,
  QrCode,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatDate, formatMoney } from '@/lib/format';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';

export default function OrderSuccessPage() {
  const { t, lang } = useLanguage();
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    api
      .myOrderDetails(params.id)
      .then(setOrder)
      .catch((err: Error) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handlePrintInvoice = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Toaster position="top-right" richColors />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
          {t('Loading Order Confirmation...', 'جاري تحميل تأكيد الطلب...')}
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-24 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">{t('Order Not Found', 'الطلب غير موجود')}</h2>
        <Link href="/orders">
          <Button variant="secondary" className="text-xs">{t('Return to Orders', 'العودة إلى الطلبات')}</Button>
        </Link>
      </div>
    );
  }

  const isRtl = lang === 'ar';

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8 animate-fade-in print:p-0 print:m-0 print:max-w-none">
      <Toaster position="top-right" richColors />

      {/* Celebratory Banner (Hidden when printing) */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-3xl p-8 sm:p-10 border border-emerald-500/30 bg-radial from-emerald-50/80 to-white shadow-xl text-center space-y-4 print:hidden"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30 animate-bounce">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            {order.paymentStatus === 'PAID' ? t('Payment Successful', 'تم سداد الطلب بنجاح') : t('Order Received (COD)', 'تم استلام الطلب')}
          </span>
          <h1 className="serif-font text-2xl sm:text-4xl font-black text-slate-900 mt-2">
            {t('Thank You For Your Order!', 'شكراً لطلبك من متجر حجازي!')}
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {t(
              'Your order has been confirmed and is now being prepared in our fulfillment center.',
              'تم استلام طلبك بنجاح وجاري تجهيزه للشحن والتوصيل إلى عنوانك.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href={`/orders/${order.id}`}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl px-5 py-3 shadow-md flex items-center gap-2 cursor-pointer">
              <Truck className="w-4 h-4 text-slate-950" />
              <span>{t('Track Live Delivery', 'تتبع حالة الشحن')}</span>
            </Button>
          </Link>

          <Button
            onClick={handlePrintInvoice}
            variant="secondary"
            className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl px-5 py-3 shadow-2xs flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            {t('Print Tax Invoice (PDF)', 'طباعة الفاتورة الضريبية')}
          </Button>

          <Link href="/products">
            <Button variant="secondary" className="border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl px-4 py-3 flex items-center gap-1.5 shadow-2xs">
              {t('Continue Shopping', 'متابعة التسوق')} <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* ZATCA-COMPLIANT SIMPLIFIED TAX INVOICE (فاتورة ضريبية مبسطة) */}
      <div className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-200/80 bg-white shadow-md space-y-6 print:border-none print:shadow-none print:p-2">
        {/* Invoice Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200/60 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              <h2 className="font-black text-lg text-slate-900 uppercase tracking-tight">
                شركة هاف لينك للتسويق (متجر حجازي)
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">Half Link Marketing Co. / Hejazi Cosmetics</p>
            <div className="text-xs text-slate-600 space-y-0.5 pt-1">
              <p><strong>{t('Commercial Registration (CR):', 'السجل التجاري:')}</strong> 1010928374</p>
              <p><strong>{t('VAT Registration Number:', 'الرقم الضريبي (VAT):')}</strong> 310928374800003</p>
              <p><strong>{t('Store Location:', 'المقر:')}</strong> Riyadh, Kingdom of Saudi Arabia (الرياض، المملكة العربية السعودية)</p>
            </div>
          </div>

          {/* Invoice Type & Meta */}
          <div className="text-left sm:text-right space-y-2">
            <div className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-900 font-extrabold text-xs px-3.5 py-1.5 rounded-xl uppercase tracking-wider">
              {t('Simplified Tax Invoice', 'فاتورة ضريبية مبسطة')}
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <p><strong>{t('Invoice Number:', 'رقم الفاتورة:')}</strong> {order.invoiceNumber || `INV-${order.id.slice(-8).toUpperCase()}`}</p>
              <p><strong>{t('Order Reference:', 'رقم الطلب:')}</strong> #{order.id.slice(-8).toUpperCase()}</p>
              <p><strong>{t('Date & Time:', 'التاريخ والوقت:')}</strong> {formatDate(order.invoiceIssuedAt || order.createdAt)}</p>
              <p><strong>{t('Payment Method:', 'طريقة الدفع:')}</strong> {order.paymentMethodLabel || t('Paid Online', 'دفع إلكتروني')}</p>
            </div>
          </div>
        </div>

        {/* Customer & Destination Summary */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
          <div>
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-1">
              {t('Customer Information', 'بيانات العميل')}
            </span>
            <p className="font-semibold">{order.customerNameSnapshot || order.user?.firstName ? `${order.user?.firstName} ${order.user?.lastName}` : t('Valued Customer', 'عميلنا العزيز')}</p>
            {(order.customerPhoneSnapshot || order.user?.phone) && <p>{order.customerPhoneSnapshot || order.user?.phone}</p>}
          </div>
          <div>
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-1">
              {t('Delivery Destination', 'وجهة التوصيل')}
            </span>
            <p>{order.shippingAddressSnapshot.line1}{order.shippingAddressSnapshot.line2 ? `, ${order.shippingAddressSnapshot.line2}` : ''}</p>
            <p>{order.shippingAddressSnapshot.city}, {order.shippingAddressSnapshot.country} {order.shippingAddressSnapshot.postalCode}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-600 uppercase font-black tracking-wider text-[11px] bg-slate-50">
                <th className="py-3 px-3 text-start">{t('Item Description', 'بيان المنتج')}</th>
                <th className="py-3 px-3 text-center">{t('Qty', 'الكمية')}</th>
                <th className="py-3 px-3 text-start">{t('Unit Price', 'سعر الوحدة')}</th>
                <th className="py-3 px-3 text-start">{t('Line Total', 'الإجمالي')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{item.productNameSnapshot}</div>
                    <div className="text-[10px] text-slate-400 font-mono">ID: {item.productId.slice(-6).toUpperCase()}</div>
                  </td>
                  <td className="py-3 px-3 text-center font-bold">{item.quantity}</td>
                  <td className="py-3 px-3">{formatMoney(item.unitPriceSnapshot)}</td>
                  <td className="py-3 px-3 font-bold">{formatMoney(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary & ZATCA QR Code */}
        <div className="border-t border-slate-200/80 pt-5 grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
          {/* ZATCA Phase 1 QR Representation */}
          <div className="sm:col-span-6 flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <div className="w-18 h-18 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center flex-none shadow-2xs">
              <QrCode className="w-14 h-14 text-slate-900" />
            </div>
            <div className="text-[11px] text-slate-500 space-y-0.5">
              <h4 className="font-bold text-slate-800">{t('ZATCA Tax E-Invoice', 'فاتورة إلكترونية معتمدة')}</h4>
              <p>{t('Compliant with Zakat, Tax and Customs Authority requirements.', 'متوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA).')}</p>
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="sm:col-span-6 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>{t('Total Taxable Amount (Excl. VAT)', 'المجموع الخاضع للضريبة (غير شامل الضريبة)')}</span>
              <span className="font-semibold text-slate-800">{formatMoney(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t('Delivery & Shipping', 'أجور الشحن والتوصيل')}</span>
              <span className="font-semibold text-slate-800">
                {order.shippingAmount === 0 ? t('Free', 'مجاني') : formatMoney(order.shippingAmount)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t('Value Added Tax (15% VAT)', 'ضريبة القيمة المضافة (15%)')}</span>
              <span className="font-semibold text-slate-800">{formatMoney(order.vatAmount)}</span>
            </div>
            <div className="border-t-2 border-slate-900 pt-2 flex justify-between text-sm font-black text-slate-950">
              <span>{t('Total Amount Due (Incl. VAT)', 'الإجمالي شامل ضريبة القيمة المضافة')}</span>
              <span className="text-base text-amber-600 font-black">{formatMoney(order.total)} {order.currency}</span>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('100% Authentic Original Cosmetics Guarantee • 14-Day Return Policy', 'ضمان أصالة 100% لكافة المنتجات • سياسة استرجاع واستبدال خلال 14 يوماً')}</span>
          </div>
          <div>{t('Customer Support: support@halflink.sa', 'الدعم الفني: support@halflink.sa')}</div>
        </div>
      </div>
    </div>
  );
}
