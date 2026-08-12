'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { XCircle, ArrowLeft } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatDate, formatMoney } from '@/lib/format';
import { storefrontSettings } from '@/lib/storefront';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';
import { OrderTrackerStepper } from '@/components/store/order-tracker-stepper';

export default function OrderDetailsPage() {
  const { t, lang } = useLanguage();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = () => {
    if (!params.id) return;
    setLoading(true);
    api
      .myOrderDetails(params.id)
      .then(setOrder)
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm('Are you sure you want to cancel this order? Reserved items will be returned to stock.')) return;

    setCancelling(true);
    try {
      const updated = await api.cancelOrder(order.id);
      setOrder(updated);
      toast.success('Order cancelled successfully. Stock has been restored.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Toaster position="top-right" richColors />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">
          {t('Loading order details...', 'جاري تحميل تفاصيل الطلب...')}
        </p>
      </div>
    );
  }

  if (!order) return <p className="text-red-500 text-center py-20">{t('Order not found', 'الطلب غير موجود')}</p>;

  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';

  const orderSteps = [
    { key: 'PENDING', labelEn: 'Order Placed', labelAr: 'تم تقديم الطلب' },
    { key: 'CONFIRMED', labelEn: 'Confirmed', labelAr: 'تم التأكيد والجهوزية' },
    { key: 'PROCESSING', labelEn: 'Ready to Dispatch', labelAr: 'جاهز للتسليم والإنطلاق' },
    { key: 'SHIPPED', labelEn: 'Out for Delivery', labelAr: 'جاري التوصيل' },
    { key: 'DELIVERED', labelEn: 'Delivered', labelAr: 'تم التوصيل بنجاح' },
  ];

  const statusIndexMap: Record<string, number> = {
    PENDING: 0,
    CONFIRMED: 1,
    PROCESSING: 2,
    SHIPPED: 3,
    DELIVERED: 4,
  };

  const currentStepIndex = statusIndexMap[order.status] ?? (order.status === 'CANCELLED' ? -1 : 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-16">
      <Toaster position="top-right" richColors />

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/50 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="serif-font text-2xl sm:text-3xl font-bold text-slate-800">
              {t('Order', 'طلب')} #{order.id.slice(-8).toUpperCase()}
            </h1>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                order.status === 'DELIVERED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.status === 'CANCELLED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {t('Placed on', 'تاريخ الطلب:')} {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canCancel && (
            <Button
              onClick={handleCancelOrder}
              disabled={cancelling}
              variant="secondary"
              className="border-red-200 text-red-600 hover:bg-red-50 text-xs flex items-center gap-1.5 font-bold"
            >
              <XCircle className="w-4 h-4" /> {cancelling ? t('Cancelling...', 'جاري الإلغاء...') : t('Cancel Order', 'إلغاء الطلب')}
            </Button>
          )}

          <Link href="/orders">
            <Button variant="secondary" className="border-slate-200 text-xs flex items-center gap-1.5 font-bold rounded-xl py-2 px-3.5 shadow-2xs hover:bg-slate-100">
              <ArrowLeft className={`w-3.5 h-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`} /> {t('Back to Orders', 'العودة إلى طلباتي')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Visual Tracking Stepper */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200/50 bg-white shadow-xs">
        <OrderTrackerStepper status={order.status} driverName={order.driverName} driverPhone={order.driverPhone} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-5 border border-slate-200/40 space-y-3 text-xs text-slate-600 bg-white">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            {t('Payment & Delivery Info', 'معلومات الدفع والتوصيل')}
          </h2>
          <p><strong className="text-slate-700">{t('Payment Status:', 'حالة الدفع:')}</strong> {order.paymentStatus}</p>
          <p><strong className="text-slate-700">{t('Payment Method:', 'طريقة الدفع:')}</strong> {order.paymentMethodLabel ?? t('Cash on Delivery', 'الدفع عند الاستلام')}</p>
          <p><strong className="text-slate-700">{t('Delivery Estimate:', 'موعد التوصيل المتوقع:')}</strong> {order.deliveryEstimate ?? t('3 to 5 business days', 'من 3 إلى 5 أيام عمل')}</p>
          <p><strong className="text-slate-700">{t('Invoice Number:', 'رقم الفاتورة:')}</strong> {order.invoiceNumber ?? t('Pending', 'قيد الاصدار')}</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/40 space-y-3 text-xs text-slate-600 bg-white">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            {t('Shipping Address', 'عنوان الشحن والتسليم')}
          </h2>
          <p className="font-semibold text-slate-800">{order.shippingAddressSnapshot.line1}</p>
          {order.shippingAddressSnapshot.line2 && <p>{order.shippingAddressSnapshot.line2}</p>}
          <p>{order.shippingAddressSnapshot.city}, {order.shippingAddressSnapshot.country} {order.shippingAddressSnapshot.postalCode}</p>
        </div>
      </div>

      {/* Items List */}
      <div className="glass-card rounded-2xl p-5 border border-slate-200/40 space-y-4 bg-white">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
          {t('Ordered Cosmetic Items', 'المنتجات المطلوبة')}
        </h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b border-slate-100 pb-2 text-xs">
              <div>
                <p className="font-bold text-slate-800">{item.productNameSnapshot}</p>
                <p className="text-slate-400">{t('Qty:', 'الكمية:')} {item.quantity}</p>
              </div>
              <span className="font-bold text-slate-800">{formatMoney(item.lineTotal, order.currency)}</span>
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="pt-2 border-t border-slate-200/50 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>{t('Subtotal', 'المجموع الفرعي')}</span>
            <span>{formatMoney(order.subtotal, order.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('VAT (15%)', 'ضريبة القيمة المضافة (15%)')}</span>
            <span>{formatMoney(order.vatAmount, order.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('Shipping Fee', 'رسوم الشحن')}</span>
            <span>{formatMoney(order.shippingAmount, order.currency)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-200/50 pt-2">
            <span>{t('Total', 'الإجمالي النهائى')}</span>
            <span className="text-emerald-700">{formatMoney(order.total, order.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
