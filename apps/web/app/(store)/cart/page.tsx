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
import { useLanguage } from '@/lib/language-context';
import {
  calculateOrderTotal,
  calculateVatAmount,
  DEFAULT_DELIVERY_ESTIMATE,
  DEFAULT_SHIPPING_FEE,
  VAT_RATE,
} from '@/lib/storefront';

export default function CartPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [cart, setCart] = useState<Cart | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('MADA');
  const [placing, setPlacing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponResponse | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    Promise.all([api.cart(), api.profile().catch(() => null)])
      .then(([cartData, profileData]) => {
        setCart(cartData);
        setProfile(profileData);
      })
      .catch((err: Error) => toast.error(err.message));
  }, []);

  const updateQty = async (itemId: string, newQty: number) => {
    if (!cart || newQty < 1) return;
    try {
      const updated = await api.updateCartItem(itemId, newQty);
      setCart(updated);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update quantity');
    }
  };

  const removeItem = async (itemId: string) => {
    if (!cart) return;
    setRemovingId(itemId);
    try {
      const updated = await api.deleteCartItem(itemId);
      setCart(updated);
      toast.success(t('Item removed from cart', 'تم حذف المنتج من السلة'));
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setApplyingCoupon(true);
    try {
      const subtotal = cart?.summary.subtotal || 0;
      const res = await api.applyCoupon(couponInput.trim(), subtotal);
      setAppliedCoupon(res);
      toast.success(t(`Coupon "${res.code}" applied! Saved ${formatMoney(res.discountAmount)}`, `تم تطبيق كود الخصم "${res.code}"! وفرت ${formatMoney(res.discountAmount)}`));
    } catch (err: any) {
      toast.error(err.message || 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const placeOrder = async () => {
    if (!cart || cart.items.length === 0) return;
    if (!profile) {
      toast.error(t('Please log in or create an account to complete checkout', 'يرجى تسجيل الدخول أو إنشاء حساب لاستكمال الطلب'));
      router.push('/login');
      return;
    }
    if (!profile?.defaultAddress) {
      toast.error(t('Please add a delivery address before placing order', 'يرجى تحديد عنوان التوصيل قبل تقديم الطلب'));
      return;
    }
    setPlacing(true);

    try {
      const order = await api.createOrder({
        customerName: profile ? `${profile.firstName} ${profile.lastName}`.trim() : undefined,
        customerPhone: profile?.phone || undefined,
        shippingAddress: {
          line1: profile.defaultAddress.line1,
          line2: profile.defaultAddress.line2 || undefined,
          city: profile.defaultAddress.city,
          country: profile.defaultAddress.country,
          postalCode: profile.defaultAddress.postalCode,
        },
        currency: 'SAR',
      });
      toast.success(t('Order placed successfully!', 'تم إرسال طلبك بنجاح!'));
      router.push(`/orders/${order.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Toaster position="top-right" richColors />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500"></div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
          {t('Loading Cart...', 'جاري تحميل السلة...')}
        </p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="space-y-6 text-center py-16 animate-fade-in max-w-md mx-auto">
        <Toaster position="top-right" richColors />
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 backdrop-blur-sm p-12 space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h1 className="text-lg font-bold text-slate-800">{t('Your cart is empty', 'سلة مشترياتك فارغة')}</h1>
          <p className="text-xs text-slate-500">
            {t('Explore our certified surveillance cameras and heavy-duty power solutions.', 'استكشف أنظمة الطاقة الشمسية وكاميرات المراقبة المعتمدة لدينا واطلبها الآن.')}
          </p>
          <Link href="/products" className="inline-block pt-2">
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20">{t('Explore Energy & Security Products', 'استكشف منتجات الطاقة والمراقبة')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const rawSubtotal = cart.summary.subtotal;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const subtotalAfterDiscount = Math.max(0, rawSubtotal - discountAmount);
  const shippingAmount = cart.items.length > 0 ? DEFAULT_SHIPPING_FEE : 0;

  const total = calculateOrderTotal(subtotalAfterDiscount, shippingAmount);
  const vatAmount = calculateVatAmount(total);

  return (
    <div className="space-y-8 animate-fade-in">
      <Toaster position="top-right" richColors />
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/50 pb-6">
        <div className="space-y-1">
          <h1 className="serif-font text-3xl md:text-4xl font-bold text-slate-800">
            {t('Shopping Cart', 'سلة التسوق')}
          </h1>
        </div>
        <Link href="/products" className="inline-block">
          <Button type="button" variant="secondary" className="border-slate-200 hover:border-slate-300">
            {t('Continue Shopping', 'متابعة التسوق')}
          </Button>
        </Link>
      </div>

      {cart.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 backdrop-blur-sm p-12 text-center space-y-4">
          <p className="text-slate-500 text-sm">{t('Your shopping cart is empty.', 'سلة التسوق فارغة.')}</p>
          <Link href="/products" className="inline-block">
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20">{t('Explore Energy & Security Products', 'استكشف منتجات الطاقة والمراقبة')}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            {/* Unified Selected Products Box */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-xs uppercase tracking-widest font-bold text-slate-700">
                  {t('Selected Products', 'المنتجات المختارة')}
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  {cart.summary.totalItems} {t('items', 'منتجات')}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {cart.items.map((item) => {
                  const stockStatus = getStockStatus(item.product.stockQuantity);

                  return (
                    <div
                      key={item.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
                    >
                      <div className="space-y-2">
                        <h3 className="text-base font-extrabold text-black">{item.product.name}</h3>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs text-slate-500 font-medium">{formatMoney(item.product.price)} {t('each', 'للقطعة')}</span>
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

                        <p className="text-sm font-black text-black min-w-[80px] text-right">
                          {formatMoney(item.lineTotal)}
                        </p>
                        
                        <button
                          className="text-xs uppercase tracking-wider font-bold text-red-500 hover:text-red-600 active:scale-95 transition"
                          onClick={() => removeItem(item.id)}
                          disabled={removingId === item.id}
                        >
                          {removingId === item.id ? '...' : t('Remove', 'حذف')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Selector Section */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-6">
              <PaymentSelector selectedMethod={selectedPayment} onSelectMethod={setSelectedPayment} />
              
              <Button
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20 transition-all text-sm"
                disabled={placing}
                onClick={placeOrder}
              >
                {placing ? t('Processing Order...', 'جاري معالجة الطلب...') : `${t('Pay & Place Order', 'ادفع وأكد الطلب')} (${formatMoney(total)})`}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Promo Coupon Code Block */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-500" />
                <h2 className="text-xs uppercase tracking-widest font-bold text-slate-800">{t('Promotional Coupon', 'كوبون الخصم')}</h2>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-600" />
                    <span>{t('Coupon', 'كوبون')} <strong>{appliedCoupon.code}</strong> {t('Applied', 'مطبق')}</span>
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="text-[10px] uppercase tracking-wider font-bold text-slate-500 hover:text-red-600"
                  >
                    {t('Remove', 'إلغاء')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder={t('Enter coupon code (e.g. HALFLINK)', 'أدخل رمز الكوبون (مثال: HALFLINK)')}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 uppercase font-semibold"
                  />
                  <Button type="submit" disabled={applyingCoupon} className="text-xs bg-slate-950 text-amber-400 hover:bg-amber-400 hover:text-slate-950 border border-amber-500/30 px-4 font-bold">
                    {applyingCoupon ? '...' : t('Apply', 'تطبيق')}
                  </Button>
                </form>
              )}
            </div>

            {/* Checkout Summary Block */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-6">
              <div>
                <h2 className="text-xs uppercase tracking-widest font-bold text-slate-800">{t('Order Summary', 'ملخص الطلب')}</h2>
                <p className="text-[10px] text-slate-400 mt-1">
                  {t('15% VAT included. Prices are calculated in SAR.', 'شامل 15% ضريبة القيمة المضافة. الأسعار بالريال السعودي.')}
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>{t('Subtotal', 'المجموع الفرعي')}</span>
                  <span className="font-semibold text-slate-700">{formatMoney(rawSubtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-amber-600 font-semibold">
                    <span>{t('Discount', 'الخصم')} ({appliedCoupon.code})</span>
                    <span>-{formatMoney(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500">
                  <span>{t('Shipping', 'الشحن والتوصيل')}</span>
                  <span className="font-semibold text-slate-700">{formatMoney(shippingAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{t('VAT (15%)', 'ضريبة القيمة المضافة (15%)')}</span>
                  <span className="font-semibold text-slate-700">{formatMoney(vatAmount)}</span>
                </div>
                <div className="border-t border-slate-200/50 pt-3 flex justify-between text-sm font-bold text-slate-800">
                  <span>{t('Total Due', 'الإجمالي المستحق')}</span>
                  <span className="text-slate-950 font-black">{formatMoney(total)}</span>
                </div>
              </div>

              <div className="border-t border-slate-200/50 pt-3 space-y-1.5 text-[10px] text-slate-400">
                <p><span className="font-semibold text-slate-500 uppercase tracking-wider">{t('Delivery Estimate:', 'موعد التوصيل المتوقع:')}</span> {DEFAULT_DELIVERY_ESTIMATE}</p>
                <p><span className="font-semibold text-slate-500 uppercase tracking-wider">{t('Selected Payment:', 'طريقة الدفع المختارة:')}</span> {selectedPayment.replace('_', ' ')}</p>
              </div>
            </div>

            {/* Delivery Address Block */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-4">
              <div>
                <h2 className="text-xs uppercase tracking-widest font-bold text-slate-800">{t('Delivery Address', 'عنوان التوصيل')}</h2>
                <p className="text-[10px] text-slate-400 mt-1">{t('Orders will be shipped to your default address.', 'سيتم شحن طلبك إلى عنوانك الرئيسي.')}</p>
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
                      {t('Change Address', 'تغيير العنوان')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 italic">{t('No delivery address specified.', 'لم يتم تحديد عنوان التوصيل.')}</p>
                  <Link href="/cart/address" className="inline-block">
                    <Button type="button" variant="secondary" className="border-slate-200 hover:border-slate-300 py-2 text-[10px]">
                      {t('Add Delivery Address', 'إضافة عنوان التوصيل')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
