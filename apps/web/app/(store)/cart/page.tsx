'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Cart } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatMoney } from '@/lib/format';
import { getStockStatus } from '@/lib/stock';
import Link from 'next/link';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const load = () =>
    api
      .cart()
      .then(setCart)
      .catch((e: Error) => setMessage(e.message));

  useEffect(() => {
    load();
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
    const next = await api.deleteCartItem(id);
    setCart(next);
  };

  const placeOrder = async () => {
    if (!cart || cart.items.length === 0) return;
    setPlacing(true);
    setMessage(null);

    try {
      await api.createOrder({
        shippingAddress: {
          line1: '24 Bloom Street',
          city: 'Los Angeles',
          country: 'USA',
          postalCode: '90001',
        },
        currency: 'SAR',
      });
      setMessage('Order placed successfully. Payment flow will be added in Phase 3.');
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setPlacing(false);
    }
  };

  if (!cart) return <p>Loading cart...</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/products" className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold">
            Back to products
          </Link>
        </div>
      </div>
      {cart.items.length === 0 ? (
        <p className="rounded border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          Your cart is empty. <Link href="/products" className="text-brand-700">Browse products</Link>.
        </p>
      ) : (
        <div className="space-y-3">
          {cart.items.map((item) => {
            const stockStatus = getStockStatus(item.product.stockQuantity);

            return (
              <div key={item.id} className="flex items-center justify-between rounded border bg-white p-4">
                <div>
                  <p className="font-semibold">{item.product.name}</p>
                  <p className="text-sm text-slate-600">{formatMoney(item.product.price)} each</p>
                  <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={item.quantity}
                    min={1}
                    max={item.product.stockQuantity}
                    className="w-20 rounded border px-2 py-1"
                    onChange={(e) => updateQty(item.id, Number(e.target.value))}
                  />
                  <p className="w-20 text-right font-semibold">{formatMoney(item.lineTotal)}</p>
                  <Button variant="danger" onClick={() => removeItem(item.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}

          <div className="rounded border bg-white p-4 text-right">
            <p className="text-sm text-slate-600">Items: {cart.summary.totalItems}</p>
            <p className="text-xl font-bold">Subtotal: {formatMoney(cart.summary.subtotal)}</p>
            <Button className="mt-3" disabled={placing} onClick={placeOrder}>
              {placing ? 'Placing order...' : 'Place order'}
            </Button>
          </div>
        </div>
      )}

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </div>
  );
}
