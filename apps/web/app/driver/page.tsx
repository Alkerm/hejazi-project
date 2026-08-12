'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Truck, Phone, MessageSquare, MapPin, CheckCircle2, RefreshCw, UserCheck, Shield, ArrowLeft } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { formatMoney } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';

export default function DriverDashboardPage() {
  const { t } = useLanguage();
  const [driverName, setDriverName] = useState<string>('Driver Sami');
  const [driverPhone, setDriverPhone] = useState<string>('0501234567');
  const [driverId, setDriverId] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'MY_DELIVERIES' | 'AVAILABLE'>('MY_DELIVERIES');

  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then((me) => {
        if (me) {
          const fullName = `${me.firstName} ${me.lastName}`.trim();
          setDriverName(fullName || 'Driver Sami');
          if (me.phone) setDriverPhone(me.phone);
          setDriverId(me.id);
          setIsAdmin(me.role === 'ADMIN');
        }
      })
      .catch(() => {});
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const identifier = driverId || driverName;
      const [avail, mine] = await Promise.all([
        api.getAvailableDeliveries(),
        api.getMyAssignedDeliveries(identifier),
      ]);
      setAvailableOrders(avail);
      setMyOrders(mine);
    } catch (err: any) {
      toast.error(err.message || t('Failed to load driver manifest', 'فشل تحميل بيان الشحنات'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [driverName, driverId]);

  const handleClaimOrder = async (orderId: string) => {
    try {
      await api.assignDriver(orderId, driverName, driverPhone);
      toast.success(t('Order claimed! Moved to your active delivery list.', 'تم استلام الشحنة! تمت إضافتها إلى قائمة شحناتك الحالية.'));
      await loadData();
      setActiveTab('MY_DELIVERIES');
    } catch (err: any) {
      toast.error(err.message || t('Failed to claim order', 'فشل استلام الشحنة'));
    }
  };

  const handleCompleteDelivery = async (orderId: string) => {
    try {
      await api.completeDelivery(orderId, driverName);
      toast.success(t('Order marked DELIVERED and payment updated!', 'تم تسجيل الشحنة كـ تم التوصيل بنجاح!'));
      await loadData();
    } catch (err: any) {
      toast.error(err.message || t('Failed to mark delivery completed', 'فشل تغيير حالة الشحنة إلى تم التوصيل'));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-lg mx-auto pb-20 px-4">
      <Toaster position="top-right" richColors />

      {/* Admin Return Back Button Badge */}
      {isAdmin && (
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-xs shadow-md">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Shield className="w-4 h-4" />
            <span>{t('Admin Preview Mode', 'وضع معاينة المشرف')}</span>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs transition shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>{t('Return to Admin Dashboard', 'العودة للوحة التحكم')}</span>
          </Link>
        </div>
      )}

      {/* Header & Driver Profile */}
      <div className="glass-card rounded-2xl p-5 border border-slate-200/50 space-y-4 shadow-sm bg-slate-900 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{t('Hejazi Express Driver', 'سائق توصيل حجازي إكسبرس')}</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">{t('Mobile Dispatch Portal', 'بوابة التوصيل والشحنات')}</p>
            </div>
          </div>
          <button onClick={loadData} className="p-2 hover:bg-slate-800 rounded-lg text-slate-300">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Driver identity input */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">{t('Driver Name:', 'اسم السائق:')}</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">{t('Driver Phone:', 'هاتف السائق:')}</label>
            <input
              type="text"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/60 rounded-xl text-xs font-bold">
        <button
          onClick={() => setActiveTab('MY_DELIVERIES')}
          className={`py-2.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'MY_DELIVERIES'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('My Deliveries', 'شحناتي الحالية')} ({myOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('AVAILABLE')}
          className={`py-2.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'AVAILABLE'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('Ready to Pickup', 'جاهزة للاستلام')} ({availableOrders.length})
        </button>
      </div>

      {/* Tab 1: My Deliveries Today */}
      {activeTab === 'MY_DELIVERIES' && (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500 text-xs space-y-2">
              <Truck className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-bold text-slate-700">{t('No active deliveries claimed yet', 'لا توجد شحنات مستلمة حالياً')}</p>
              <p>{t('Switch to "Ready to Pickup" tab to claim orders ready for delivery.', 'انتقل إلى تبويب "جاهزة للاستلام" لاستلام الطلبات الجاهزة.')}</p>
            </div>
          ) : (
            myOrders.map((order) => {
              const customerName = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Customer';
              const customerPhone = order.user?.phone || '0500000000';
              const cleanPhone = customerPhone.replace(/\D/g, '');
              const waPhone = cleanPhone.startsWith('05') ? `966${cleanPhone.slice(1)}` : cleanPhone;
              const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(
                `Hello ${customerName}! I am your Hejazi Cosmetics delivery driver for Order #${order.id.slice(-8)}. I will arrive shortly.`
              )}`;
              const callLink = `tel:${customerPhone}`;
              const mapAddress = `${order.shippingAddressSnapshot.line1}, ${order.shippingAddressSnapshot.city}, ${order.shippingAddressSnapshot.country}`;
              const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}`;

              return (
                <div key={order.id} className="glass-card rounded-2xl p-5 border border-slate-200/50 space-y-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-bold text-sm text-slate-800">{t('Order #', 'طلب رقم #')}{order.id.slice(-8)}</span>
                      <p className="text-xs text-slate-500">{customerName}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {order.paymentStatus === 'PAID' ? t('PAID ONLINE', 'مدفوع إلكترونياً') : `${t('COLLECT', 'تحصيل')} ${formatMoney(order.total, order.currency)} ${t('COD', 'نقداً عند الاستلام')}`}
                    </span>
                  </div>

                  {/* Address Box */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-slate-800 block">{t('Delivery Address:', 'عنوان التوصيل:')}</span>
                    <p>{order.shippingAddressSnapshot.line1}</p>
                    {order.shippingAddressSnapshot.line2 && <p>{order.shippingAddressSnapshot.line2}</p>}
                    <p>{order.shippingAddressSnapshot.city}, {order.shippingAddressSnapshot.country}</p>
                  </div>

                  {/* Driver 1-Click Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <a
                      href={callLink}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] border border-blue-200/60"
                    >
                      <Phone className="w-4 h-4 mb-1 text-blue-600" />
                      {t('Call', 'اتصال')}
                    </a>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] border border-emerald-200/60"
                    >
                      <MessageSquare className="w-4 h-4 mb-1 text-emerald-600" />
                      {t('WhatsApp', 'واتساب')}
                    </a>
                    <a
                      href={mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-[11px] border border-purple-200/60"
                    >
                      <MapPin className="w-4 h-4 mb-1 text-purple-600" />
                      {t('Maps GPS', 'الخرائط')}
                    </a>
                  </div>

                  {/* Complete Delivery Button */}
                  <Button
                    onClick={() => handleCompleteDelivery(order.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-xs flex items-center justify-center gap-2 rounded-xl"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {t('Confirm Handover & Mark Delivered', 'تأكيد التسليم وتغيير الحالة إلى تم التوصيل')}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Available Ready to Pickup */}
      {activeTab === 'AVAILABLE' && (
        <div className="space-y-4">
          {availableOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500 text-xs">
              {t('No orders ready for delivery pickup right now.', 'لا توجد طلبات جاهزة للتوصيل في الوقت الحالي.')}
            </div>
          ) : (
            availableOrders.map((order) => (
              <div key={order.id} className="glass-card rounded-2xl p-5 border border-slate-200/50 space-y-3 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-sm text-slate-800">{t('Order #', 'طلب رقم #')}{order.id.slice(-8)}</span>
                  <span className="text-xs font-bold text-emerald-700">{formatMoney(order.total, order.currency)}</span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p><strong className="text-slate-700">{t('Destination:', 'الوجهة:')}</strong> {order.shippingAddressSnapshot.city}</p>
                  <p><strong className="text-slate-700">{t('Items:', 'المنتجات:')}</strong> {order.items.length} {t('cosmetic products', 'منتجات تجميلية')}</p>
                </div>

                <Button
                  onClick={() => handleClaimOrder(order.id)}
                  className="w-full bg-slate-900 text-white font-semibold py-2.5 text-xs flex items-center justify-center gap-2 rounded-xl"
                >
                  <UserCheck className="w-4 h-4" />
                  {t('Claim / Assign Order to Me', 'استلام الشحنة وتعيينها لي')}
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
