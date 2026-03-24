'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatMoney } from '@/lib/format';
import { Button } from '@/components/ui/button';

const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export default function AdminOrderDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.adminOrderDetails(params.id).then((nextOrder) => {
      setOrder(nextOrder);
      setSelectedStatus(nextOrder.status);
    });

  useEffect(() => {
    if (!params.id) return;
    load().catch((e: Error) => setMessage(e.message));
  }, [params.id]);

  const confirmStatusUpdate = async () => {
    if (!order || !selectedStatus || selectedStatus === order.status) return;

    setSaving(true);
    setMessage(null);

    try {
      await api.adminUpdateOrderStatus(params.id, selectedStatus);
      await load();
      setMessage('Order status updated');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!order) return <p>{message ?? 'Loading order...'}</p>;

  const hasPendingChange = selectedStatus !== null && selectedStatus !== order.status;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Order #{order.id.slice(-8)}</h2>
      </div>
      <p className="text-sm text-slate-600">Customer: {order.user?.email}</p>
      <p className="text-sm text-slate-600">Payment: {order.paymentStatus}</p>
      <p className="font-semibold">Total: {formatMoney(order.total, order.currency)}</p>

      <div className="rounded border bg-white p-4">
        <div className="mb-4">
          <h3 className="mb-2 font-semibold">Order Status</h3>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <Button
                key={status}
                variant={(selectedStatus ?? order.status) === status ? 'primary' : 'secondary'}
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </Button>
            ))}
          </div>

          {hasPendingChange ? (
            <div className="mt-4">
              <p className="text-sm text-slate-600">
                Selected status: <span className="font-semibold">{selectedStatus}</span>
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">Current status: {order.status}</p>
          )}
        </div>

        <div className="border-t border-slate-200 pt-4">
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

        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
          {hasPendingChange ? (
            <>
              <Button onClick={confirmStatusUpdate} disabled={saving}>
                {saving ? 'Updating...' : 'Confirm update'}
              </Button>
              <Button variant="secondary" onClick={() => setSelectedStatus(order.status)} disabled={saving}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => router.push('/admin/orders')}>
              Back to Orders
            </Button>
          )}
        </div>
        </div>
      </div>

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </div>
  );
}
