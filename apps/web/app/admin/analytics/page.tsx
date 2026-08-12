'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatMoney } from '@/lib/format';
import { StatCard } from '@/components/admin/stat-card';
import { useLanguage } from '@/lib/language-context';

export default function AdminAnalyticsPage() {
  const { t } = useLanguage();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Awaited<ReturnType<typeof api.adminSalesAnalytics>> | null>(null);

  useEffect(() => {
    api.adminSalesAnalytics(`?days=${days}`).then(setData).catch(() => null);
  }, [days]);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">
          {t('Loading analytics...', 'جاري تحميل التقارير والتحليلات...')}
        </p>
      </div>
    );
  }

  // Calculate maximum values for visual bar scaling
  const maxProductRevenue = Math.max(...data.topProducts.map((p) => p.revenue), 1);
  const maxCustomerSpend = Math.max(...data.topCustomers.map((c) => c.totalSpent), 1);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/50 pb-6">
        <div className="space-y-1">
          <h1 className="serif-font text-3xl font-bold text-slate-800">{t('Sales Analytics', 'تحليلات وتقارير المبيعات')}</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            {t('In-depth performance metrics and analytics', 'تحليلات الأداء ومؤشرات المبيعات التفصيلية')}
          </p>
        </div>
        <select
          className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-amber-500"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>{t('Last 7 Days', 'آخر 7 أيام')}</option>
          <option value={30}>{t('Last 30 Days', 'آخر 30 يوم')}</option>
          <option value={90}>{t('Last 90 Days', 'آخر 90 يوم')}</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label={t('Revenue for Period', 'إجمالي الإيرادات للفترة')} value={formatMoney(data.totalRevenue)} />
        <StatCard label={t('Total Orders', 'إجمالي عدد الطلبات')} value={data.totalOrders} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-4">
          <h3 className="text-xs uppercase tracking-widest font-bold text-slate-700 border-b border-slate-200/40 pb-2">
            Top Performing Products
          </h3>
          <div className="space-y-4">
            {data.topProducts.map((item) => {
              const widthPct = Math.min((item.revenue / maxProductRevenue) * 100, 100);
              return (
                <div key={item.productId} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-700 font-semibold">{item.productName}</span>
                    <span className="text-slate-500">{item.unitsSold} units · {formatMoney(item.revenue)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full luxury-gradient rounded-full" style={{ width: `${widthPct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Customers Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-4">
          <h3 className="text-xs uppercase tracking-widest font-bold text-slate-700 border-b border-slate-200/40 pb-2">
            Top Customers
          </h3>
          <div className="space-y-4">
            {data.topCustomers.map((customer) => {
              const widthPct = Math.min((customer.totalSpent / maxCustomerSpend) * 100, 100);
              return (
                <div key={customer.userId} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <div>
                      <span className="text-slate-700 font-semibold block">{customer.customerName}</span>
                      <span className="text-[10px] text-slate-400">{customer.email ?? 'No email'}</span>
                    </div>
                    <span className="text-slate-500 text-right">
                      {customer.ordersCount} orders · {formatMoney(customer.totalSpent)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-800 rounded-full" style={{ width: `${widthPct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by Day Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-4 lg:col-span-2">
          <h3 className="text-xs uppercase tracking-widest font-bold text-slate-700 border-b border-slate-200/40 pb-2">
            Revenue Daily Breakdown
          </h3>
          <div className="divide-y divide-slate-100">
            {data.salesByDay.map((row) => (
              <div key={row.day} className="flex justify-between items-center py-3 text-xs">
                <span className="font-semibold text-slate-700">{row.day}</span>
                <div className="flex items-center gap-4">
                  <span className="text-slate-500">{row.orders} order{row.orders === 1 ? '' : 's'}</span>
                  <span className="font-bold text-slate-850">{formatMoney(row.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
