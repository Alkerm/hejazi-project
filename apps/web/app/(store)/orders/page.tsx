'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatDate, formatMoney } from '@/lib/format';
import { Pagination } from '@/components/ui/pagination';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api
      .myOrders(`?page=${page}&pageSize=10`)
      .then((res) => {
        setOrders(res.items);
        setTotalPages(res.meta.totalPages || 1);
      })
      .catch((e: Error) => setMessage(e.message));
  }, [page]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/cart" className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold">
            Cart
          </Link>
          <Link href="/products" className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold">
            Back to products
          </Link>
        </div>
      </div>
      {orders.length === 0 ? (
        <p className="rounded border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          No orders yet.
        </p>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <Link
              href={`/orders/${order.id}`}
              key={order.id}
              className="block rounded border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Order #{order.id.slice(-8)}</p>
                  <p className="text-sm text-slate-600">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">{order.status}</p>
                  <p className="font-semibold">{formatMoney(order.total, order.currency)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      {message && <p className="text-sm text-red-600">{message}</p>}
    </div>
  );
}
