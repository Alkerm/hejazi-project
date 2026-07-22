'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatMoney } from '@/lib/format';
import { StatCard } from '@/components/admin/stat-card';

export default function AdminDashboardPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.adminSummary>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.adminSummary().then(setData).catch((e: Error) => setError(e.message));
  }, []);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-1">
        <h1 className="serif-font text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest">Real-time overview of store operations and sales</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Revenue" value={formatMoney(data.cards.totalRevenue)} />
        <StatCard label="Total Orders" value={data.cards.totalOrders} />
        <StatCard label="Active Products" value={data.cards.productsCount} />
        <StatCard label="Low Stock Products" value={data.cards.lowStockCount} />
        <StatCard label="Pending Orders" value={data.cards.pendingOrdersCount} />
        <StatCard label="Total Customers" value={data.cards.usersCount} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-bold text-slate-700 border-b border-slate-200/40 pb-2">
            Recent Orders
          </h2>
          <div className="divide-y divide-slate-100">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-700">
                    {order.user?.firstName} {order.user?.lastName}
                  </p>
                  <p className="text-[10px] text-slate-400">Order #{order.id.slice(-6).toUpperCase()}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-[10px] uppercase text-slate-600">
                  {order.status}
                </span>
                <span className="font-bold text-slate-800">{formatMoney(order.total, order.currency)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-bold text-slate-700 border-b border-slate-200/40 pb-2">
            Top Selling Products
          </h2>
          <div className="divide-y divide-slate-100">
            {data.topProducts.map((item) => (
              <div key={item.productId} className="flex items-center justify-between py-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-700">{item.productName}</p>
                  <p className="text-[10px] text-slate-400">{item.unitsSold} units sold</p>
                </div>
                <span className="font-bold text-slate-800">{formatMoney(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
