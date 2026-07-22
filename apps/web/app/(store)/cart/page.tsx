'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Check } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { Cart, UserProfile, AppliedCouponResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatMoney } from '@/lib/format';
import { getStockStatus } from '@/lib/stock';
import Link from 'next/link';
import { PaymentSelector, PaymentMethod } from '@/components/store/payment-selector';
import {
  calculateOrderTotal,
  calculateVatAmount,
  DEFAULT_DELIVERY_ESTIMATE,
  DEFAULT_SHIPPING_FEE,
  VAT_RATE,
} from '@/lib/storefront';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('MADA');
  const [placing, setPlacing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponResponse | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const load = () =>
    api
      .cart()
      .then(setCart)
      .catch((e: Error) => toast.error(e.message));

  useEffect(() => {
    load();
    api
      .profile()
      .then(setProfile)
      .catch((e: Error) => toast.error(e.message));
  }, []);

  const updateQty = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      const next = await api.updateCartItem(id, quantity);
      setCart(next);
      toast.success('Cart updated');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const removeItem = async (id: string) => {
    setRemovingId(id);

    try {
      const next = await api.deleteCartItem(id);
      setCart(next);
      toast.success('Item removed from cart');
    } catch (e) {
      toast.error((e as Error).message);
      await load();
    } finally {
      setRemovingId(null);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || !couponInput.trim()) return;
    setApplyingCoupon(true);

    try {
      const res = await api.applyCoupon(couponInput, cart.summary.subtotal);
      setAppliedCoupon(res);
      toast.success(`Coupon "${res.code}" applied! You saved ${formatMoney(res.discountAmount)}`);
    } catch (err: any) {
      toast.error(err.message || 'Invalid or expired coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const placeOrder = async () => {
    if (!cart || cart.items.length === 0) return;
    if (!profile?.defaultAddress) {
      toast.error('Please complete your delivery address before placing your order.');
      return;
    }
    setPlacing(true);

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

      toast.success('Order placed successfully!');
      router.push(`/orders/${order.id}`);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setPlacing(false);
    }
  };

  if (!cart) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Toaster position="top-right" richColors />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">Loading cart...</p>
      </div>
    );
  }

  const rawSubtotal = cart.summary.subtotal;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const effectiveSubtotal = Math.max(0, rawSubtotal - discountAmount);
  const shippingAmount = DEFAULT_SHIPPING_FEE;
  const vatAmount = calculateVatAmount(effectiveSubtotal);
  const total = calculateOrderTotal(effectiveSubtotal, shippingAmount);

  return (
    <div className="space-y-8 animate-fade-in">
      <Toaster position="top-right" richColors />
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/50 pb-6">
        <div className="space-y-1">
          <h1 className="serif-font text-3xl md:text-4xl font-bold text-slate-800">Shopping Cart</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            Confirm your cosmetic items, promo code, and delivery details
          </p>
        </div>
        <Link href="/products" className="inline-block">
          <Button type="button" variant="secondary" className="border-slate-200 hover:border-slate-300">
            Continue Shopping
          </Button>
        </Link>
      </div>

      {cart.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 backdrop-blur-sm p-12 text-center space-y-4">
          <p className="text-slate-500 text-sm">Your shopping cart is empty.</p>
          <Link href="/products" className="inline-block">
            <Button>Explore Cosmetic Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs uppercase tracking-widest font-bold text-slate-700">Selected Products</h2>
              <span className="text-xs text-slate-500 font-medium">
                {cart.summary.totalItems} item{cart.summary.totalItems === 1 ? '' : 's'}
              </span>
            </div>

            <div className="space-y-4">
              {cart.items.map((item) => {
                const stockStatus = getStockStatus(item.product.stockQuantity);

                return (
                  <div
                    key={item.id}
                    className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border border-slate-200/40 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-slate-800">{item.product.name}</h3>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs text-slate-500 font-medium">{formatMoney(item.product.price)} each</span>
                        <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                        <button 
                          className="px-2.5 py-1 text-slate-500 hover:bg-slate-50 transition active:scale-90"
                          onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-slate-700 min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          className="px-2.5 py-1 text-slate-500 hover:bg-slate-50 transition active:scale-90"
                          onClick={() => updateQty(item.id, Math.min(item.product.stockQuantity, item.quantity + 1))}
                        >
                          +
                        </button>
                      </div>

                      <p className="text-sm font-bold text-slate-800 min-w-[80px] text-right">
                        {formatMoney(item.lineTotal)}
                      </p>
                      
                      <button
                        className="text-xs uppercase tracking-wider font-bold text-red-500 hover:text-red-600 active:scale-95 transition"
                        onClick={() => removeItem(item.id)}
                        disabled={removingId === item.id}
                      >
                        {removingId === item.id ? '...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Selector Section */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200/40">
              <PaymentSelector selectedMethod={selectedPayment} onSelectMethod={setSelectedPayment} />
            </div>
          </div>

          <div className="space-y-6">
            {/* Promo Coupon Code Block */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xs uppercase tracking-widest font-bold text-slate-800">Promotional Coupon</h2>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-800 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> Applied</span>
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="text-[10px] uppercase tracking-wider font-bold text-slate-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter coupon code (e.g. HEJAZI20)"
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase font-semibold"
                  />
                  <Button type="submit" disabled={applyingCoupon} className="text-xs bg-slate-900 text-white px-4">
                    {applyingCoupon ? '...' : 'Apply'}
                  </Button>
                </form>
              )}
            </div>

            {/* Checkout Summary Block */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-6">
              <div>
                <h2 className="text-xs uppercase tracking-widest font-bold text-slate-800">Order Summary</h2>
                <p className="text-[10px] text-slate-400 mt-1">
                  15% VAT included. Prices are calculated in SAR.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-700">{formatMoney(rawSubtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-{formatMoney(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-700">{formatMoney(shippingAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>VAT (15%)</span>
                  <span className="font-semibold text-slate-700">{formatMoney(vatAmount)}</span>
                </div>
                <div className="border-t border-slate-200/50 pt-3 flex justify-between text-sm font-bold text-slate-800">
                  <span>Total Due</span>
                  <span className="text-emerald-700">{formatMoney(total)}</span>
                </div>
              </div>

              <div className="border-t border-slate-200/50 pt-3 space-y-1.5 text-[10px] text-slate-400">
                <p><span className="font-semibold text-slate-500 uppercase tracking-wider">Delivery Estimate:</span> {DEFAULT_DELIVERY_ESTIMATE}</p>
                <p><span className="font-semibold text-slate-500 uppercase tracking-wider">Selected Payment:</span> {selectedPayment.replace('_', ' ')}</p>
              </div>
            </div>

            {/* Delivery Address Block */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-4">
              <div>
                <h2 className="text-xs uppercase tracking-widest font-bold text-slate-800">Delivery Address</h2>
                <p className="text-[10px] text-slate-400 mt-1">Orders will be shipped to your default address.</p>
              </div>

              {profile?.defaultAddress ? (
                <div className="space-y-3">
                  <div className="text-xs text-slate-600 leading-relaxed font-light">
                    <p className="font-medium text-slate-700">{profile.defaultAddress.line1}</p>
                    {profile.defaultAddress.line2 && <p>{profile.defaultAddress.line2}</p>}
                    <p>{profile.defaultAddress.city}, {profile.defaultAddress.country} {profile.defaultAddress.postalCode}</p>
                  </div>
                  <Link href="/cart/address" className="inline-block">
                    <Button type="button" variant="secondary" className="border-slate-200 hover:border-slate-300 py-2 text-[10px]">
                      Change Address
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 italic">No delivery address specified.</p>
                  <Link href="/cart/address" className="inline-block">
                    <Button type="button" variant="secondary" className="border-slate-200 hover:border-slate-300 py-2 text-[10px]">
                      Add Delivery Address
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <Button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 transition-all" disabled={placing} onClick={placeOrder}>
              {placing ? 'Processing Order...' : `Pay & Place Order (${formatMoney(total)})`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
