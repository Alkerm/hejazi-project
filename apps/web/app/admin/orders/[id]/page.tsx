'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle2, RotateCcw, ArrowLeft } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatDate, formatMoney } from '@/lib/format';
import { Button } from '@/components/ui/button';

const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export default function AdminOrderDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const load = async () => {
    try {
      const nextOrder = await api.adminOrderDetails(params.id);
      setOrder(nextOrder);
      setSelectedStatus(nextOrder.status);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load order');
    }
  };

  useEffect(() => {
    if (!params.id) return;
    load();
  }, [params.id]);

  const confirmStatusUpdate = async () => {
    if (!order || !selectedStatus || selectedStatus === order.status) return;

    setSaving(true);
    try {
      await api.adminUpdateOrderStatus(params.id, selectedStatus);
      await load();
      toast.success(`Order status updated to ${selectedStatus}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to update order status');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaymentStatus = async (paymentStatus: string) => {
    if (!order) return;
    setUpdatingPayment(true);

    try {
      if (paymentStatus === 'REFUNDED') {
        await api.refundPayment(order.id, 'Customer requested refund');
      } else {
        await api.adminUpdatePaymentStatus(order.id, paymentStatus);
      }
      toast.success(`Payment status updated to ${paymentStatus}`);
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Payment status update failed');
    } finally {
      setUpdatingPayment(false);
    }
  };

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Toaster position="top-right" richColors />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">Loading order details...</p>
      </div>
    );
  }

  const hasPendingChange = selectedStatus !== null && selectedStatus !== order.status;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
      <Toaster position="top-right" richColors />

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/50 pb-4">
        <div>
          <h1 className="serif-font text-3xl font-bold text-slate-800">Order #{order.id.slice(-8)}</h1>
          <p className="text-xs text-slate-500">Customer: {order.user?.email} • Placed {formatDate(order.createdAt)}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            order.paymentStatus === 'PAID'
              ? 'bg-emerald-100 text-emerald-800'
              : order.paymentStatus === 'REFUNDED'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            Payment: {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-6">
        {/* Payment Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
          <div>
            <span className="text-xs font-bold text-slate-700 block">Payment Reconciliation</span>
            <span className="text-[10px] text-slate-500">
              Method: {order.paymentMethodLabel ?? 'Cash on Delivery'} • Total: {formatMoney(order.total, order.currency)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {order.paymentStatus !== 'PAID' && (
              <Button
                onClick={() => handleMarkPaymentStatus('PAID')}
                disabled={updatingPayment}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1.5 py-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark COD Paid
              </Button>
            )}

            {order.paymentStatus === 'PAID' && (
              <Button
                onClick={() => handleMarkPaymentStatus('REFUNDED')}
                disabled={updatingPayment}
                variant="secondary"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 text-xs flex items-center gap-1.5 py-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Issue Refund
              </Button>
            )}
          </div>
        </div>

        {/* Order Status Selector */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-widest font-bold text-slate-700">Order Fulfillment Status</h3>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <Button
                key={status}
                variant={(selectedStatus ?? order.status) === status ? 'primary' : 'secondary'}
                onClick={() => setSelectedStatus(status)}
                className="text-xs"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Financial & Invoice Breakdown */}
        <div className="border-t border-slate-200/50 pt-4 space-y-4">
          <h3 className="text-xs uppercase tracking-widest font-bold text-slate-700">Invoice Details</h3>
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50/50 p-4 rounded-xl">
            <p><strong className="text-slate-700">Invoice Number:</strong> {order.invoiceNumber ?? 'Pending'}</p>
            <p><strong className="text-slate-700">Invoice Date:</strong> {order.invoiceIssuedAt ? formatDate(order.invoiceIssuedAt) : 'Pending'}</p>
            <p><strong className="text-slate-700">Refund Note:</strong> {order.refundNoteNumber ?? 'None'}</p>
            <p><strong className="text-slate-700">Refund Date:</strong> {order.refundIssuedAt ? formatDate(order.refundIssuedAt) : 'None'}</p>
          </div>

          <h3 className="text-xs uppercase tracking-widest font-bold text-slate-700 pt-2">Line Items</h3>
          <div className="space-y-2 text-xs">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between border-b border-slate-100 pb-2">
                <span>{item.productNameSnapshot} x {item.quantity}</span>
                <span className="font-bold text-slate-800">{formatMoney(item.lineTotal, order.currency)}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200/50 flex items-center justify-between">
            {hasPendingChange ? (
              <div className="flex items-center gap-2">
                <Button onClick={confirmStatusUpdate} disabled={saving} className="bg-slate-900 text-white text-xs">
                  {saving ? 'Saving...' : 'Confirm Status Update'}
                </Button>
                <Button variant="secondary" onClick={() => setSelectedStatus(order.status)} disabled={saving} className="text-xs">
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="secondary" onClick={() => router.push('/admin/orders')} className="text-xs flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders List
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
