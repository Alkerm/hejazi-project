'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle2, RotateCcw, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { Order, DriverAccount } from '@/lib/types';
import { formatDate, formatMoney } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';

const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export default function AdminOrderDetailsPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [registeredDrivers, setRegisteredDrivers] = useState<DriverAccount[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [assigningDriver, setAssigningDriver] = useState(false);

  const statusLabels: Record<string, { en: string; ar: string }> = {
    PENDING: { en: 'Pending', ar: 'قيد الانتظار' },
    CONFIRMED: { en: 'Confirmed', ar: 'تم التأكيد' },
    PROCESSING: { en: 'Ready to Dispatch', ar: 'جاهز للتسليم والإنطلاق' },
    SHIPPED: { en: 'Out For Delivery', ar: 'جاري التوصيل' },
    DELIVERED: { en: 'Delivered', ar: 'تم التوصيل بنجاح' },
    CANCELLED: { en: 'Cancelled', ar: 'ملغي' },
  };

  const getStatusText = (st: string) => {
    if (statusLabels[st]) {
      return lang === 'ar' ? statusLabels[st].ar : statusLabels[st].en;
    }
    return st;
  };

  const load = async () => {
    try {
      const [nextOrder, drivers] = await Promise.all([
        api.adminOrderDetails(params.id),
        api.adminGetRegisteredDrivers(),
      ]);
      setOrder(nextOrder);
      setSelectedStatus(nextOrder.status);
      setRegisteredDrivers(drivers);
      if (nextOrder.driverId) {
        setSelectedDriverId(nextOrder.driverId);
      }
    } catch (err: any) {
      toast.error(err.message || t('Failed to load order', 'فشل تحميل الطلب'));
    }
  };

  useEffect(() => {
    if (!params.id) return;
    load();
  }, [params.id]);

  const handleAssignRegisteredDriver = async () => {
    if (!selectedDriverId || !order) return;
    setAssigningDriver(true);
    try {
      await api.adminAssignRegisteredDriver(order.id, selectedDriverId);
      toast.success(t('Order assigned to registered driver', 'تم إسناد الطلب للسائق المسجل'));
      await load();
    } catch (err: any) {
      toast.error(err.message || t('Failed to assign registered driver', 'فشل إسناد الطلب للسائق'));
    } finally {
      setAssigningDriver(false);
    }
  };

  const confirmStatusUpdate = async () => {
    if (!order || !selectedStatus || selectedStatus === order.status) return;

    if (selectedStatus === 'SHIPPED' && !order.driverId && !order.driverName) {
      toast.error(
        t(
          'Please assign a driver before changing status to Out for Delivery.',
          'يرجى تعيين سائق أولاً قبل تحويل حالة الطلب إلى "جاري التوصيل".'
        )
      );
      return;
    }

    setSaving(true);
    try {
      await api.adminUpdateOrderStatus(params.id, selectedStatus);
      await load();
      toast.success(t(`Order status updated to ${getStatusText(selectedStatus)}`, `تم تحديث حالة الطلب إلى "${getStatusText(selectedStatus)}"`));
    } catch (e: any) {
      toast.error(e.message || t('Failed to update order status', 'فشل تحديث حالة الطلب'));
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaymentStatus = async (paymentStatus: string) => {
    if (!order) return;
    setUpdatingPayment(true);

    try {
      await api.adminUpdatePaymentStatus(order.id, paymentStatus);
      toast.success(t(`Payment status updated to ${paymentStatus}`, `تم تحديث حالة الدفع إلى "${paymentStatus}"`));
      await load();
    } catch (err: any) {
      toast.error(err.message || t('Payment status update failed', 'فشل تحديث حالة الدفع'));
    } finally {
      setUpdatingPayment(false);
    }
  };

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Toaster position="top-right" richColors />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">
          {t('Loading order details...', 'جاري تحميل تفاصيل الطلب...')}
        </p>
      </div>
    );
  }

  const hasPendingChange = selectedStatus !== null && selectedStatus !== order.status;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
      <Toaster position="top-right" richColors />

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/50 pb-4">
        <div>
          <h1 className="serif-font text-3xl font-bold text-slate-800">{t('Order #', 'طلب رقم #')}{order.id.slice(-8)}</h1>
          <p className="text-xs text-slate-500">
            {t('Customer:', 'العميل:')} {order.customerNameSnapshot || `${order.user?.firstName ?? ''} ${order.user?.lastName ?? ''}`.trim() || order.user?.email}
            {(order.customerPhoneSnapshot || order.user?.phone) && ` • ${order.customerPhoneSnapshot || order.user?.phone}`}
            {` • ${formatDate(order.createdAt)}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            order.paymentStatus === 'PAID'
              ? 'bg-emerald-100 text-emerald-800'
              : order.paymentStatus === 'REFUNDED'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {t('Payment:', 'حالة الدفع:')} {order.paymentStatus === 'PAID' ? t('PAID', 'مدفوع') : order.paymentStatus === 'REFUNDED' ? t('REFUNDED', 'مسترجع') : t('PENDING', 'بانتظار السداد')}
          </span>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-6">
        {/* Payment Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
          <div>
            <span className="text-xs font-bold text-slate-700 block">{t('Payment Reconciliation', 'سجل الدفع والتحصيل')}</span>
            <span className="text-[10px] text-slate-500">
              {t('Method:', 'طريقة الدفع:')} {order.paymentMethodLabel ?? t('Cash on Delivery', 'الدفع عند الاستلام')} • {t('Total:', 'المبلغ:')} {formatMoney(order.total, order.currency)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {order.paymentStatus !== 'PAID' && (
              <Button
                onClick={() => handleMarkPaymentStatus('PAID')}
                disabled={updatingPayment}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1.5 py-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> {t('Mark COD Paid', 'تسجيل استلام المبلغ (تم السداد)')}
              </Button>
            )}

            {order.paymentStatus === 'PAID' && (
              <Button
                onClick={() => handleMarkPaymentStatus('REFUNDED')}
                disabled={updatingPayment}
                variant="secondary"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 text-xs flex items-center gap-1.5 py-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> {t('Issue Refund', 'إرجاع المبلغ للعميل')}
              </Button>
            )}
          </div>
        </div>

        {/* Order Status Selector */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-widest font-bold text-slate-700">{t('Order Fulfillment Status', 'حالة تتبع وشحن الطلب')}</h3>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <Button
                key={status}
                variant={(selectedStatus ?? order.status) === status ? 'primary' : 'secondary'}
                onClick={() => setSelectedStatus(status)}
                className="text-xs"
              >
                {getStatusText(status)}
              </Button>
            ))}
          </div>

          {hasPendingChange && (
            <div className="pt-2">
              <Button
                onClick={confirmStatusUpdate}
                disabled={saving}
                className="bg-amber-500 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl"
              >
                {saving ? t('Saving...', 'جاري الحفظ...') : `${t('Save Status Change to', 'حفظ تغيير الحالة إلى')} "${getStatusText(selectedStatus!)}"`}
              </Button>
            </div>
          )}
        </div>

        {/* Registered Driver Assignment - Only visible when order reaches Ready to Dispatch (PROCESSING), SHIPPED, or DELIVERED */}
        <div className="space-y-3 border-t border-slate-200/50 pt-4">
          <h3 className="text-xs uppercase tracking-widest font-bold text-slate-700">{t('Assigned Registered Driver', 'السائق المسؤول عن التوصيل')}</h3>

          {['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? (
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
              <div>
                {order.driverName ? (
                  <div>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      {t('Driver:', 'السائق:')} {order.driverName}
                    </p>
                    {order.driverPhone && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{t('Phone:', 'الهاتف:')} {order.driverPhone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs italic text-amber-700 font-medium">
                    {t('No registered driver currently assigned to this delivery.', 'لم يتم تعيين سائق لهذه الشحنة بعد.')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">{t('-- Select Registered Driver --', '-- اختر سائقاً --')}</option>
                  {registeredDrivers.map((drv) => (
                    <option key={drv.id} value={drv.id}>
                      {drv.firstName} {drv.lastName} ({drv.phone || drv.email})
                    </option>
                  ))}
                </select>

                <Button
                  type="button"
                  onClick={handleAssignRegisteredDriver}
                  disabled={assigningDriver || !selectedDriverId}
                  className="bg-amber-500 text-slate-950 font-bold text-xs py-1.5"
                >
                  {assigningDriver ? '...' : t('Assign Driver', 'تأكيد التعيين')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 font-medium">
              {t(
                'Driver assignment will become available once the order is moved to "Ready to Dispatch" status.',
                'سيكون اختيار وتعيين السائق متاحاً بمجرد تحويل حالة الطلب إلى "جاهز للتسليم والإنطلاق".'
              )}
            </div>
          )}
        </div>

        {/* Order Items Snapshot */}
        <div className="space-y-3 border-t border-slate-200/50 pt-4">
          <h3 className="text-xs uppercase tracking-widest font-bold text-slate-700">{t('Order Items', 'المنتجات المطلوبة')}</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between py-2">
                <span>{item.productNameSnapshot} x {item.quantity}</span>
                <span className="font-bold text-slate-800">{formatMoney(item.lineTotal, order.currency)}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200/50 flex items-center justify-between">
            <Button variant="secondary" onClick={() => router.push('/admin/orders')} className="text-xs flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" /> {t('Back to Orders List', 'العودة لقائمة الطلبات')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
