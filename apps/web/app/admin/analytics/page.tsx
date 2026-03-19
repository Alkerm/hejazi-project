'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatMoney } from '@/lib/format';
import { StatCard } from '@/components/admin/stat-card';

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Awaited<ReturnType<typeof api.adminSalesAnalytics>> | null>(null);

  useEffect(() => {
    api.adminSalesAnalytics(`?days=${days}`).then(setData).catch(() => null);
  }, [days]);

  if (!data) return <p>Loading analytics...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sales Analytics</h2>
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Revenue" value={formatMoney(data.totalRevenue)} />
        <StatCard label="Orders" value={data.totalOrders} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded border bg-white p-4">
          <h3 className="mb-2 font-semibold">Top Products</h3>
          <div className="space-y-2 text-sm">
            {data.topProducts.map((item) => (
              <div key={item.productId} className="flex justify-between border-b pb-2">
                <span>{item.productName}</span>
                <span>{item.unitsSold} units</span>
                <span>{formatMoney(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded border bg-white p-4">
          <h3 className="mb-2 font-semibold">Revenue by Day</h3>
          <div className="space-y-2 text-sm">
            {data.salesByDay.map((row) => (
              <div key={row.day} className="flex justify-between border-b pb-2">
                <span>{row.day}</span>
                <span>{row.orders} orders</span>
                <span>{formatMoney(row.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
