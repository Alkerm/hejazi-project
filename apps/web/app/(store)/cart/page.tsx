'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Cart, UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatMoney } from '@/lib/format';
import { getStockStatus } from '@/lib/stock';
import Link from 'next/link';
import {
  calculateOrderTotal,
  calculateVatAmount,
  DEFAULT_DELIVERY_ESTIMATE,
  DEFAULT_PAYMENT_METHOD_LABEL,
  DEFAULT_SHIPPING_FEE,
  VAT_RATE,
} from '@/lib/storefront';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = () =>
    api
      .cart()
      .then(setCart)
      .catch((e: Error) => setMessage(e.message));

  useEffect(() => {
    load();
    api
      .profile()
      .then(setProfile)
      .catch((e: Error) => setMessage(e.message));
  }, []);

  const updateQty = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      const next = await api.updateCartItem(id, quantity);
      setCart(next);
    } catch (e) {
      setMessage((e as Error).message);
    }
  };

  const removeItem = async (id: string) => {
    setRemovingId(id);
    setMessage(null);

    try {
      const next = await api.deleteCartItem(id);
      setCart(next);
    } catch (e) {
      setMessage((e as Error).message);
      await load();
    } finally {
      setRemovingId(null);
    }
  };

  const placeOrder = async () => {
    if (!cart || cart.items.length === 0) return;
    if (!profile?.defaultAddress) {
      setMessage('Complete the shipping address before placing the order.');
      return;
    }
    setPlacing(true);
    setMessage(null);

    try {
      const order = await api.createOrder({
        shippingAddress: {
          line1: profile.defaultAddress.line1,
          line2: profile.defaultAddress.line2 || undefined,
          city: profile.defaultAddress.city,
          country: profile.defaultAddress.country,
          postalCode: profile.defaultAddress.postalCode,
        },
        currency: 'SAR',
      });
      router.push(`/orders/${order.id}`);
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setPlacing(false);
    }
  };

  if (!cart) return <p>Loading cart...</p>;

  const subtotal = cart.summary.subtotal;
  const shippingAmount = DEFAULT_SHIPPING_FEE;
  const vatAmount = calculateVatAmount(subtotal);
  const total = calculateOrderTotal(subtotal, shippingAmount);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review your items, confirm your address, and place the order when ready.
          </p>
        </div>
        <Link href="/products" className="inline-block">
          <Button type="button" variant="secondary">
            Continue shopping
          </Button>
        </Link>
      </div>

      {message && <p className="text-sm text-slate-700">{message}</p>}

      {cart.items.length === 0 ? (
        <p className="rounded border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          Your cart is empty.{' '}
          <Link href="/products" className="text-brand-700">
            Browse products
          </Link>
          .
        </p>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded border bg-white p-4">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-semibold">Cart Items</h2>
              <p className="text-sm text-slate-600">
                {cart.summary.totalItems} item{cart.summary.totalItems === 1 ? '' : 's'}
              </p>
            </div>

            <div className="space-y-3">
              {cart.items.map((item) => {
                const stockStatus = getStockStatus(item.product.stockQuantity);

                return (
                  <div
                    key={item.id}
                    className="grid gap-4 rounded-xl border border-slate-200 p-4 md:grid-cols-[minmax(0,1fr)_320px]"
                  >
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-slate-900">{item.product.name}</p>
                      <p className="text-sm text-slate-600">{formatMoney(item.product.price)} each</p>
                      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                    </div>

                    <div className="grid grid-cols-[96px_1fr_auto] items-center gap-3">
                      <input
                        type="number"
                        value={item.quantity}
                        min={1}
                        max={item.product.stockQuantity}
                        className="w-24 rounded border border-slate-300 px-3 py-2"
                        onChange={(e) => updateQty(item.id, Number(e.target.value))}
                      />
                      <p className="text-right text-lg font-semibold text-slate-900">
                        {formatMoney(item.lineTotal)}
                      </p>
                      <Button
                        variant="danger"
                        onClick={() => removeItem(item.id)}
                        disabled={removingId === item.id}
                      >
                        {removingId === item.id ? 'Removing...' : 'Remove'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <div className="rounded border bg-white p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Checkout Summary</h2>
                  <p className="text-sm text-slate-600">
                    VAT is charged at {(VAT_RATE * 100).toFixed(0)}%. Shipping is a placeholder until
                    carrier rules are finalized.
                  </p>
                </div>
                <p className="text-sm text-slate-600">Items: {cart.summary.totalItems}</p>
              </div>

              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatMoney(shippingAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT</span>
                  <span>{formatMoney(vatAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 text-slate-600">
                  <p>Delivery estimate: {DEFAULT_DELIVERY_ESTIMATE}</p>
                  <p>Payment method: {DEFAULT_PAYMENT_METHOD_LABEL}</p>
                </div>
              </div>
            </div>

            <div className="rounded border bg-white p-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Shipping Address</h2>
                <p className="text-sm text-slate-600">Manage your delivery address on a separate page.</p>
              </div>

              {profile?.defaultAddress ? (
                <div className="space-y-2 text-sm text-slate-700">
                  <p>{profile.defaultAddress.line1}</p>
                  {profile.defaultAddress.line2 ? <p>{profile.defaultAddress.line2}</p> : null}
                  <p>
                    {profile.defaultAddress.city}, {profile.defaultAddress.country}{' '}
                    {profile.defaultAddress.postalCode}
                  </p>
                  <Link href="/cart/address" className="inline-block">
                    <Button type="button" variant="secondary" className="mt-2">
                      Change address
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">No shipping address saved yet.</p>
                  <Link href="/cart/address" className="inline-block">
                    <Button type="button" variant="secondary">
                      Add address
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <Button className="w-full" disabled={placing} onClick={placeOrder}>
              {placing ? 'Placing order...' : 'Place order'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
