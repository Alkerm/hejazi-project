'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatDate, formatMoney } from '@/lib/format';
import { Pagination } from '@/components/ui/pagination';
import { useLanguage } from '@/lib/language-context';

export default function AdminOrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const statusOptions = [
    { value: 'PENDING', labelEn: 'Pending', labelAr: 'قيد الانتظار' },
    { value: 'CONFIRMED', labelEn: 'Confirmed', labelAr: 'تم التأكيد' },
    { value: 'PROCESSING', labelEn: 'Ready to Dispatch', labelAr: 'جاهز للتسليم والإنطلاق' },
    { value: 'SHIPPED', labelEn: 'Out for Delivery', labelAr: 'جاري التوصيل' },
    { value: 'DELIVERED', labelEn: 'Delivered', labelAr: 'تم التوصيل بنجاح' },
    { value: 'CANCELLED', labelEn: 'Cancelled', labelAr: 'ملغي' },
  ];

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'PENDING':
        return { label: t('Pending', 'قيد الانتظار'), cls: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'CONFIRMED':
        return { label: t('Confirmed', 'تم التأكيد'), cls: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'PROCESSING':
        return { label: t('Ready to Dispatch', 'جاهز للتسليم والإنطلاق'), cls: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'SHIPPED':
        return { label: t('Out for Delivery', 'جاري التوصيل'), cls: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'DELIVERED':
        return { label: t('Delivered', 'تم التوصيل بنجاح'), cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'CANCELLED':
        return { label: t('Cancelled', 'ملغي'), cls: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { label: st, cls: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  useEffect(() => {
    const query = new URLSearchParams({ page: String(page), pageSize: '20' });
    if (status) query.set('status', status);

    api
      .adminOrders(`?${query.toString()}`)
      .then((res) => {
        setOrders(res.items);
        setTotalPages(res.meta.totalPages || 1);
      })
      .catch((e: Error) => setMessage(e.message));
  }, [page, status]);

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const idMatch = o.id.toLowerCase().includes(q) || o.id.slice(-8).toLowerCase().includes(q);
    const invoiceMatch = o.invoiceNumber ? o.invoiceNumber.toLowerCase().includes(q) : false;
    const emailMatch = o.user?.email ? o.user.email.toLowerCase().includes(q) : false;
    return idMatch || invoiceMatch || emailMatch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">{t('Orders Management', 'إدارة الطلبات')}</h2>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search Bar */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:right-3 rtl:left-auto pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search Order #, Invoice, Email', 'ابحث برقم الطلب، الفاتورة، الإيميل')}
              className="pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 w-72 sm:w-80"
            />
          </div>

          <select
            className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold bg-white shadow-2xs focus:ring-2 focus:ring-amber-500/20"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">{t('All statuses', 'جميع الحالات')}</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {t(s.labelEn, s.labelAr)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 border border-slate-200/60 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-start">{t('Order ID', 'رقم الطلب')}</th>
                <th className="px-4 py-3 text-start">{t('Customer', 'العميل')}</th>
                <th className="px-4 py-3 text-start">{t('Invoice', 'الفاتورة')}</th>
                <th className="px-4 py-3 text-start">{t('Status', 'الحالة')}</th>
                <th className="px-4 py-3 text-start">{t('Total', 'الإجمالي')}</th>
                <th className="px-4 py-3 text-start">{t('Date', 'التاريخ')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    {t('No matching orders found', 'لا توجد طلبات تطابق البحث')}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => (window.location.href = `/admin/orders/${order.id}`)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5 font-bold text-slate-800">#{order.id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3.5 truncate max-w-[200px] text-slate-700">{order.user?.email ?? '-'}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-600">{order.invoiceNumber ?? t('Pending', 'قيد الانتظار')}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 font-bold text-[10px] uppercase border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{formatMoney(order.total, order.currency)}</td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      {message && <p className="text-sm text-red-600">{message}</p>}
    </div>
  );
}
