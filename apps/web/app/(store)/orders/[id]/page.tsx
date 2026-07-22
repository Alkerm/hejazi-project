'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { XCircle, ArrowLeft } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatDate, formatMoney } from '@/lib/format';
import { storefrontSettings } from '@/lib/storefront';
import { Button } from '@/components/ui/button';

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = () => {
    if (!params.id) return;
    setLoading(true);
    api
      .myOrderDetails(params.id)
      .then(setOrder)
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm('Are you sure you want to cancel this order? Reserved items will be returned to stock.')) return;

    setCancelling(true);
    try {
      const updated = await api.cancelOrder(order.id);
      setOrder(updated);
      toast.success('Order cancelled successfully. Stock has been restored.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Toaster position="top-right" richColors />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">Loading order details...</p>
      </div>
    );
  }

  if (!order) return <p className="text-red-500 text-center py-20">Order not found</p>;

  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
      <Toaster position="top-right" richColors />

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/50 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="serif-font text-3xl font-bold text-slate-800">Order #{order.id.slice(-8)}</h1>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                order.status === 'CONFIRMED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.status === 'CANCELLED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-xs text-slate-500">Placed on {formatDate(order.createdAt)}</p>
        </div>

        {canCancel && (
          <Button
            onClick={handleCancelOrder}
            disabled={cancelling}
            variant="secondary"
            className="border-red-200 text-red-600 hover:bg-red-50 text-xs flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-5 border border-slate-200/40 space-y-3 text-xs text-slate-600">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            Payment & Delivery Info
          </h2>
          <p><strong className="text-slate-700">Payment Status:</strong> {order.paymentStatus}</p>
          <p><strong className="text-slate-700">Payment Method:</strong> {order.paymentMethodLabel ?? 'Cash on Delivery'}</p>
          <p><strong className="text-slate-700">Delivery Estimate:</strong> {order.deliveryEstimate ?? '3 to 5 business days'}</p>
          <p><strong className="text-slate-700">Invoice Number:</strong> {order.invoiceNumber ?? 'Pending'}</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/40 space-y-3 text-xs text-slate-600">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
            Shipping Address
          </h2>
          <p className="font-semibold text-slate-800">{order.shippingAddressSnapshot.line1}</p>
          {order.shippingAddressSnapshot.line2 && <p>{order.shippingAddressSnapshot.line2}</p>}
          <p>{order.shippingAddressSnapshot.city}, {order.shippingAddressSnapshot.country} {order.shippingAddressSnapshot.postalCode}</p>
        </div>
      </div>

      {/* Items List */}
      <div className="glass-card rounded-2xl p-5 border border-slate-200/40 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
          Ordered Cosmetic Items
        </h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b border-slate-100 pb-2 text-xs">
              <div>
                <p className="font-bold text-slate-800">{item.productNameSnapshot}</p>
                <p className="text-slate-400">Qty: {item.quantity}</p>
              </div>
              <span className="font-bold text-slate-800">{formatMoney(item.lineTotal, order.currency)}</span>
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="pt-2 border-t border-slate-200/50 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatMoney(order.subtotal, order.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT (15%)</span>
            <span>{formatMoney(order.vatAmount, order.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping Fee</span>
            <span>{formatMoney(order.shippingAmount, order.currency)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-200/50 pt-2">
            <span>Total</span>
            <span className="text-emerald-700">{formatMoney(order.total, order.currency)}</span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Link href="/orders">
          <Button variant="secondary" className="border-slate-200 text-xs flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Order History
          </Button>
        </Link>
      </div>
    </div>
  );
}
