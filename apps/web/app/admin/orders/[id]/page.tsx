'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatMoney } from '@/lib/format';
import { Button } from '@/components/ui/button';

const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export default function AdminOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = () => api.adminOrderDetails(params.id).then(setOrder);

  useEffect(() => {
    if (!params.id) return;
    load().catch((e: Error) => setMessage(e.message));
  }, [params.id]);

  const updateStatus = async (status: string) => {
    await api.adminUpdateOrderStatus(params.id, status);
    await load();
    setMessage('Order status updated');
  };

  if (!order) return <p>{message ?? 'Loading order...'}</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Order #{order.id.slice(-8)}</h2>
      <p className="text-sm text-slate-600">Customer: {order.user?.email}</p>
      <p className="text-sm text-slate-600">Payment: {order.paymentStatus}</p>
      <p className="font-semibold">Total: {formatMoney(order.total, order.currency)}</p>

      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <Button
            key={status}
            variant={order.status === status ? 'primary' : 'secondary'}
            onClick={() => updateStatus(status)}
          >
            {status}
          </Button>
        ))}
      </div>

      <div className="rounded border bg-white p-4">
        <h3 className="mb-2 font-semibold">Items</h3>
        <div className="space-y-2 text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between border-b pb-2">
              <span>
                {item.productNameSnapshot} x {item.quantity}
              </span>
              <span>{formatMoney(item.lineTotal, order.currency)}</span>
            </div>
          ))}
        </div>
      </div>

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </div>
  );
}
