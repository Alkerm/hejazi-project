'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatDate, formatMoney } from '@/lib/format';
import { Pagination } from '@/components/ui/pagination';

const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const query = new URLSearchParams({ page: String(page), pageSize: '10' });
    if (status) query.set('status', status);

    api
      .adminOrders(`?${query.toString()}`)
      .then((res) => {
        setOrders(res.items);
        setTotalPages(res.meta.totalPages || 1);
      })
      .catch((e: Error) => setMessage(e.message));
  }, [page, status]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Orders Management</h2>
        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded border bg-white p-4">
        <div className="space-y-2">
          <div className="grid grid-cols-[140px_minmax(0,1fr)_140px_140px_220px] items-center border-b pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Order ID</span>
            <span>Customer</span>
            <span>Status</span>
            <span>Total</span>
            <span>Date</span>
          </div>
          {orders.map((order) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`} className="block border-b pb-2 text-sm">
              <div className="grid grid-cols-[140px_minmax(0,1fr)_140px_140px_220px] items-center">
                <span>#{order.id.slice(-8)}</span>
                <span>{order.user?.email ?? '-'}</span>
                <span>{order.status}</span>
                <span>{formatMoney(order.total, order.currency)}</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      {message && <p className="text-sm text-red-600">{message}</p>}
    </div>
  );
}
