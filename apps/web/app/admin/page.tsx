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

  if (!data) return <p>{error ?? 'Loading dashboard...'}</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Revenue" value={formatMoney(data.cards.totalRevenue)} />
        <StatCard label="Total Orders" value={data.cards.totalOrders} />
        <StatCard label="Active Products" value={data.cards.productsCount} />
        <StatCard label="Low Stock" value={data.cards.lowStockCount} />
        <StatCard label="Pending Pipeline Orders" value={data.cards.pendingOrdersCount} />
        <StatCard label="Customers" value={data.cards.usersCount} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded border bg-white p-4">
          <h2 className="mb-3 text-lg font-bold">Recent Orders</h2>
          <div className="space-y-2">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b pb-2 text-sm">
                <span>
                  {order.user?.firstName} {order.user?.lastName}
                </span>
                <span>{order.status}</span>
                <span className="font-semibold">{formatMoney(order.total, order.currency)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded border bg-white p-4">
          <h2 className="mb-3 text-lg font-bold">Top Selling Products</h2>
          <div className="space-y-2">
            {data.topProducts.map((item) => (
              <div key={item.productId} className="flex items-center justify-between border-b pb-2 text-sm">
                <span>{item.productName}</span>
                <span>{item.unitsSold} units</span>
                <span className="font-semibold">{formatMoney(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
