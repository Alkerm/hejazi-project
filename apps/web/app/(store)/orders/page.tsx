'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight, Package, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatDate, formatMoney } from '@/lib/format';
import { Pagination } from '@/components/ui/pagination';
import { useLanguage } from '@/lib/language-context';
import { OrderTrackerStepper } from '@/components/store/order-tracker-stepper';

export default function OrdersPage() {
  const { t, lang } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .myOrders(`?page=${page}&pageSize=10`)
      .then((res) => {
        setOrders(res.items);
        setTotalPages(res.meta.totalPages || 1);
      })
      .catch((e: Error) => setMessage(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">
          {t('Loading orders', 'جاري تحميل قائمة طلباتك')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      <div className="border-b border-slate-200/60 pb-4 space-y-1">
        <h1 className="serif-font text-3xl font-bold text-slate-800">{t('My Orders', 'طلباتي ومتابعة الشحنات')}</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest">
          {t('View history and live tracking progress of your orders', 'تتبع حالة شحناتك الحالية وسجل الطلبات السابقة')}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 text-xs font-medium space-y-3">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <p>{t('No orders yet.', 'لا توجد طلبات سابقة في حسابك.')}</p>
          <Link href="/products" className="inline-block text-xs font-bold text-amber-600 hover:underline">
            {t('Explore Beauty Collection', 'تصفح كتالوج المنتجات واطلب الآن')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="glass-card rounded-2xl border border-slate-200/60 bg-white p-5 space-y-4 shadow-2xs hover:shadow-md transition"
            >
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {t('Order', 'طلب')} #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      • {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 pt-0.5">
                    {order.deliveryEstimate ?? t('3 to 5 business days', 'من 3 إلى 5 أيام عمل')}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-end">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('Total', 'الإجمالي')}</span>
                    <span className="font-extrabold text-sm text-slate-900">{formatMoney(order.total, order.currency)}</span>
                  </div>

                  <Link
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-1 bg-slate-900 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                  >
                    {t('Details', 'التفاصيل')}
                    <ChevronRight className={`w-3.5 h-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </div>

              {/* Embed Order Tracker Stepper Directly On Order Card */}
              <div className="pt-1">
                <OrderTrackerStepper status={order.status} driverName={order.driverName} driverPhone={order.driverPhone} compact={true} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      {message && <p className="text-sm text-red-600">{message}</p>}
    </div>
  );
}
