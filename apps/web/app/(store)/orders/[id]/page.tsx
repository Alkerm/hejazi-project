'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatDate, formatMoney } from '@/lib/format';
import { storefrontSettings } from '@/lib/storefront';

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    api
      .myOrderDetails(params.id)
      .then(setOrder)
      .catch((e: Error) => setMessage(e.message));
  }, [params.id]);

  if (!order) return <p>{message ?? 'Loading order...'}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Order #{order.id.slice(-8)}</h1>
      <p className="text-sm text-slate-600">Placed on {formatDate(order.createdAt)}</p>

      <div className="rounded border bg-white p-4">
        <p>Status: {order.status}</p>
        <p>Payment status: {order.paymentStatus}</p>
        <p>Payment method: {order.paymentMethodLabel ?? 'To be confirmed'}</p>
        <p>Delivery estimate: {order.deliveryEstimate ?? 'To be confirmed'}</p>
        <p>Invoice number: {order.invoiceNumber ?? 'To be assigned'}</p>
        <p>
          Invoice issued: {order.invoiceIssuedAt ? formatDate(order.invoiceIssuedAt) : 'Pending issuance'}
        </p>
      </div>

      <div className="rounded border bg-white p-4">
        <p className="mb-2 font-semibold">Order Summary</p>
        <div className="space-y-1 text-sm text-slate-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatMoney(order.subtotal, order.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatMoney(order.shippingAmount, order.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT</span>
            <span>{formatMoney(order.vatAmount, order.currency)}</span>
          </div>
          <div className="flex justify-between font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatMoney(order.total, order.currency)}</span>
          </div>
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        <p className="mb-2 font-semibold">Shipping Address</p>
        <p>{order.shippingAddressSnapshot.line1}</p>
        {order.shippingAddressSnapshot.line2 ? <p>{order.shippingAddressSnapshot.line2}</p> : null}
        <p>
          {order.shippingAddressSnapshot.city}, {order.shippingAddressSnapshot.country}{' '}
          {order.shippingAddressSnapshot.postalCode}
        </p>
      </div>

      <div className="rounded border bg-white p-4">
        <p className="mb-2 font-semibold">Items</p>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between border-b pb-2 text-sm">
              <span>
                {item.productNameSnapshot} x {item.quantity}
              </span>
              <span>{formatMoney(item.lineTotal, order.currency)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded border bg-white p-4 text-sm text-slate-700">
        <p className="mb-2 font-semibold">Support Contact</p>
        <p>Email: {storefrontSettings.email}</p>
        <p>Phone: {storefrontSettings.phone}</p>
      </div>

      <div className="pt-2">
        <Link href="/orders" className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold">
          Back to orders
        </Link>
      </div>
    </div>
  );
}
