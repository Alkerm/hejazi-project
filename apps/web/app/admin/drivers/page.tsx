'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  RefreshCw,
  Search,
  Package,
  ExternalLink,
  X,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { DriverAccount, Order } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';
import { formatMoney } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminDriversPage() {
  const { t } = useLanguage();
  const [drivers, setDrivers] = useState<DriverAccount[]>([]);
  const [deliveries, setDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DRIVERS'>('OVERVIEW');
  const [deliverySearch, setDeliverySearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [viewingDriver, setViewingDriver] = useState<DriverAccount | null>(null);

  // Modal State for New Driver Account Creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Selected driver for quick assignment
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [driversData, overviewData] = await Promise.all([
        api.adminGetRegisteredDrivers(),
        api.adminGetDeliveryOverview(),
      ]);
      setDrivers(driversData);
      setDeliveries(overviewData);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load driver operations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.adminCreateDriver({
        firstName,
        lastName,
        email,
        phone,
        password,
      });
      toast.success(t('Driver account created successfully!', 'تم إنشاء حساب السائق بنجاح!'));
      setShowCreateModal(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create driver account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignDriver = async (orderId: string) => {
    if (!selectedDriverId) {
      toast.error(t('Please select a driver', 'يرجى اختيار سائق'));
      return;
    }
    setAssigning(true);
    try {
      await api.adminAssignRegisteredDriver(orderId, selectedDriverId);
      toast.success(t('Order assigned to registered driver!', 'تم إسناد الطلب للسائق بنجاح!'));
      setAssigningOrderId(null);
      setSelectedDriverId('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign order');
    } finally {
      setAssigning(false);
    }
  };

  const unassignedCount = deliveries.filter((d) => !d.driverId && d.status !== 'DELIVERED').length;
  const inTransitCount = deliveries.filter((d) => d.status === 'SHIPPED').length;
  const completedCount = deliveries.filter((d) => d.status === 'DELIVERED').length;

  const filteredDeliveries = deliveries.filter((ord) => {
    if (!deliverySearch.trim()) return true;
    const q = deliverySearch.trim().toLowerCase();
    const idMatch = ord.id.toLowerCase().includes(q) || ord.id.slice(-8).toLowerCase().includes(q) || ord.id.slice(-6).toLowerCase().includes(q);
    const userMatch = ord.user ? `${ord.user.firstName} ${ord.user.lastName} ${ord.user.email} ${ord.user.phone}`.toLowerCase().includes(q) : false;
    const driverMatch = ord.driverName ? ord.driverName.toLowerCase().includes(q) : false;
    const addressMatch = ord.shippingAddressSnapshot ? `${ord.shippingAddressSnapshot.line1} ${ord.shippingAddressSnapshot.city}`.toLowerCase().includes(q) : false;
    return idMatch || userMatch || driverMatch || addressMatch;
  });

  const filteredDrivers = drivers.filter((drv) => {
    if (!driverSearch.trim()) return true;
    const q = driverSearch.trim().toLowerCase();
    const nameMatch = `${drv.firstName} ${drv.lastName}`.toLowerCase().includes(q);
    const emailMatch = drv.email.toLowerCase().includes(q);
    const phoneMatch = drv.phone ? drv.phone.toLowerCase().includes(q) : false;
    return nameMatch || emailMatch || phoneMatch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Toaster position="top-right" richColors />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">
          {t('Loading driver operations...', 'جاري تحميل بيان الشحنات والسائقين...')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <Toaster position="top-center" />

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="serif-font text-3xl font-bold text-slate-800">
            {t('Driver Management & Logistics', 'إدارة السائقين وتوزيع الشحنات')}
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
            {t(
              'Only Admin can register drivers and assign delivery orders',
              'إمكانية إنشاء حسابات السائقين وإسناد الطلبات للمشرف فقط'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            {t('Refresh', 'تحديث')}
          </button>

          <Button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-sm text-xs"
          >
            <UserPlus className="w-4 h-4" />
            {t('Create Driver Account', 'إضافة سائق جديد')}
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-200/50 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('Registered Drivers', 'السائقين المسجلين')}
            </span>
            <ShieldCheck className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-800">{drivers.length}</p>
          <p className="text-[10px] text-slate-400">{t('Authorized delivery personnel', 'حسابات سائقين موثقة')}</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/50 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('Unassigned Orders', 'طلبات بانتظار السائق')}
            </span>
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-amber-600">{unassignedCount}</p>
          <p className="text-[10px] text-slate-400">{t('Ready for pickup & dispatch', 'جاهزة للتوزيع')}</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/50 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('In Transit', 'قيد التوصيل')}
            </span>
            <Truck className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-blue-600">{inTransitCount}</p>
          <p className="text-[10px] text-slate-400">{t('Assigned to drivers out on road', 'جاري توصيلها للعملاء')}</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/50 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('Delivered Orders', 'طلبات مكتملة التوصيل')}
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{completedCount}</p>
          <p className="text-[10px] text-slate-400">{t('Successfully handed to customers', 'تم التوصيل بنجاح')}</p>
        </div>
      </div>

      {/* Tabs selector */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'OVERVIEW'
              ? 'text-amber-600 border-b-2 border-amber-500'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('Deliveries Overview & Assignment', 'عرض واستناد الشحنات')} ({deliveries.length})
        </button>

        <button
          onClick={() => setActiveTab('DRIVERS')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'DRIVERS'
              ? 'text-amber-600 border-b-2 border-amber-500'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('Registered Driver Accounts', 'سجل حسابات السائقين')} ({drivers.length})
        </button>
      </div>

      {/* TAB 1: DELIVERIES OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="glass-card rounded-2xl p-6 border border-slate-200/50 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
            <h2 className="text-sm uppercase font-bold tracking-wider text-slate-800">
              {t('All Delivery Orders Log', 'سجل شحنات التوصيل')} ({filteredDeliveries.length})
            </h2>

            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:right-3 rtl:left-auto" />
              <input
                type="text"
                value={deliverySearch}
                onChange={(e) => setDeliverySearch(e.target.value)}
                placeholder={t('Search Order #, Customer, Driver', 'ابحث برقم الطلب، العميل، السائق')}
                className="pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 w-72 sm:w-80 font-normal"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">{t('Order #', 'رقم الطلب')}</th>
                  <th className="px-4 py-3">{t('Customer', 'العميل')}</th>
                  <th className="px-4 py-3">{t('Address', 'العنوان')}</th>
                  <th className="px-4 py-3">{t('Total', 'الإجمالي')}</th>
                  <th className="px-4 py-3">{t('Status', 'الحالة')}</th>
                  <th className="px-4 py-3">{t('Assigned Driver', 'السائق المسؤول')}</th>
                  <th className="px-4 py-3 rounded-r-xl">{t('Action', 'الإجراء')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      {t('No orders matching search filter', 'لا توجد طلبات توصيل تطابق البحث')}
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((ord) => {
                    const isAssigningThis = assigningOrderId === ord.id;
                    const address = ord.shippingAddressSnapshot;
                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-4 font-bold text-slate-800">
                          #{ord.id.slice(-6).toUpperCase()}
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-800">
                            {ord.user ? `${ord.user.firstName} ${ord.user.lastName}` : 'Guest Customer'}
                          </p>
                          <p className="text-[10px] text-slate-400">{ord.user?.email}</p>
                          {ord.user?.phone && (
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5" /> {ord.user.phone}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4 max-w-xs">
                          <p className="font-medium text-slate-700 truncate">{address?.line1}</p>
                          <p className="text-[10px] text-slate-400">
                            {address?.city}, {address?.postalCode}
                          </p>
                        </td>

                        <td className="px-4 py-4 font-bold text-slate-900">
                          {formatMoney(ord.total, ord.currency)}
                        </td>

                        <td className="px-4 py-4">
                          {ord.status === 'DELIVERED' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              {t('Delivered', 'تم التوصيل')}
                            </span>
                          ) : ord.status === 'SHIPPED' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase text-blue-700 border border-blue-200">
                              <Truck className="w-3 h-3 animate-pulse" />
                              {t('Out For Delivery', 'جاري التوصيل')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" />
                              {t('Unassigned', 'بانتظار سائق')}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {ord.driverName ? (
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-800 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                                {ord.driverName}
                              </p>
                              {ord.driverPhone && (
                                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                  <Phone className="w-2.5 h-2.5" /> {ord.driverPhone}
                                </p>
                              )}
                              {ord.assignedAt && (
                                <p className="text-[9px] text-slate-400">
                                  Assigned: {new Date(ord.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] italic text-slate-400">
                              {t('No driver assigned', 'لم يتم تعيين سائق')}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {ord.status !== 'DELIVERED' && (
                            <div>
                              {isAssigningThis ? (
                                <div className="flex items-center gap-2">
                                  <select
                                    value={selectedDriverId}
                                    onChange={(e) => setSelectedDriverId(e.target.value)}
                                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 shadow-2xs focus:ring-1 focus:ring-amber-500"
                                  >
                                    <option value="">{t('-- Select Driver --', '-- اختر سائق --')}</option>
                                    {drivers.map((drv) => (
                                      <option key={drv.id} value={drv.id}>
                                        {drv.firstName} {drv.lastName} ({drv.phone || drv.email})
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleAssignDriver(ord.id)}
                                    disabled={assigning}
                                    className="rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-bold text-slate-950 hover:bg-amber-600 transition"
                                  >
                                    {assigning ? '...' : t('Confirm', 'تأكيد')}
                                  </button>
                                  <button
                                    onClick={() => setAssigningOrderId(null)}
                                    className="text-xs text-slate-400 hover:text-slate-600"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setAssigningOrderId(ord.id);
                                    setSelectedDriverId(ord.driverId || '');
                                  }}
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                                >
                                  {ord.driverName ? t('Re-assign', 'تغيير السائق') : t('Assign Driver', 'تعيين سائق')}
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTERED DRIVER ACCOUNTS */}
      {activeTab === 'DRIVERS' && (
        <div className="glass-card rounded-2xl p-6 border border-slate-200/50 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
            <div>
              <h2 className="text-sm uppercase font-bold tracking-wider text-slate-800">
                {t('Registered Driver Accounts List', 'قائمة حسابات السائقين المعتمدين')} ({filteredDrivers.length})
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t('Accounts created by Admin with DRIVER authorization role', 'الحسابات المنشأة بواسطة المشرف فقط')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:right-3 rtl:left-auto" />
                <input
                  type="text"
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  placeholder={t('Search Driver Name, Email, Phone', 'ابحث باسم السائق، الإيميل، الهاتف')}
                  className="pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 w-72 sm:w-80 font-normal"
                />
              </div>

              <Button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 bg-amber-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {t('New Driver', 'حساب جديد')}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDrivers.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 font-medium">
                {t('No driver accounts matching search criteria.', 'لا يوجد سائقين يطابقون البحث')}
              </div>
            ) : (
              filteredDrivers.map((drv) => (
                <div
                  key={drv.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3 shadow-2xs hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold">
                      {drv.firstName.charAt(0)}{drv.lastName.charAt(0)}
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[9px] font-extrabold text-emerald-700 uppercase tracking-wider border border-emerald-200">
                      {t('Authorized Driver', 'سائق معتمد')}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      {drv.firstName} {drv.lastName}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3 text-slate-400" /> {drv.email}
                    </p>
                    {drv.phone && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {drv.phone}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {t('Total Deliveries:', 'إجمالي التوصيلات:')} <strong className="text-slate-700">{drv._count?.driverOrders || 0}</strong>
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setViewingDriver(drv)}
                      className="border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-950 text-[10px] font-extrabold py-1 px-3 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition"
                    >
                      <Package className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t('Driver Orders', 'طلبات السائق')}</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CREATE DRIVER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-card rounded-2xl bg-white p-6 shadow-2xl space-y-6 border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-800 text-base">
                  {t('Register New Driver Account', 'إضافة سائق جديد')}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label={t('First Name', 'الاسم الأول')}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Sami"
                  required
                />
                <Input
                  label={t('Last Name', 'اسم العائلة')}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Al-Fahad"
                  required
                />
              </div>

              <Input
                label={t('Email Address', 'البريد الإلكتروني')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver.sami@halflink.sa"
                required
              />

              <Input
                label={t('Phone Number', 'رقم الجوال')}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+966501234567"
                required
              />

              <Input
                label={t('Password', 'كلمة المرور')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  {t('Cancel', 'إلغاء')}
                </button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-amber-500 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs"
                >
                  {submitting ? t('Creating...', 'جاري الإنشاء...') : t('Create Account', 'إنشاء الحساب')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRIVER ORDERS MODAL (CURRENT + COMPLETED SECTIONS) */}
      {viewingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl glass-card rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200 animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Driver Profile Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-mono font-bold text-base shadow-sm">
                  {viewingDriver.firstName.charAt(0)}{viewingDriver.lastName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {viewingDriver.firstName} {viewingDriver.lastName}
                    </h3>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[9px] font-extrabold text-emerald-700 uppercase tracking-wider border border-emerald-200">
                      {t('Authorized Driver', 'سائق معتمد')}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {viewingDriver.email}
                    </span>
                    {viewingDriver.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> <span dir="ltr">{viewingDriver.phone}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setViewingDriver(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            {(() => {
              const driverOrders = deliveries.filter(
                (d) =>
                  d.driverId === viewingDriver.id ||
                  (d.driverName &&
                    d.driverName.toLowerCase() === `${viewingDriver.firstName} ${viewingDriver.lastName}`.toLowerCase())
              );
              const currentOrders = driverOrders.filter((d) => d.status !== 'DELIVERED' && d.status !== 'CANCELLED');
              const completedOrders = driverOrders.filter((d) => d.status === 'DELIVERED');

              return (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs">
                      <span className="text-[10px] font-bold text-amber-800 uppercase block">
                        {t('Active / In-Transit', 'الطلبات الحالية')}
                      </span>
                      <span className="text-xl font-black text-amber-950 font-mono">{currentOrders.length}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                        {t('Completed Deliveries', 'الطلبات المسلمة')}
                      </span>
                      <span className="text-xl font-black text-emerald-950 font-mono">{completedOrders.length}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        {t('Total Assigned', 'إجمالي الطلبات')}
                      </span>
                      <span className="text-xl font-black text-slate-900 font-mono">{driverOrders.length}</span>
                    </div>
                  </div>

                  {/* SECTION 1: ACTIVE / CURRENT DELIVERIES */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span>{t('1. Current & Active Deliveries', '1. الطلبات الحالية قيد التوصيل')}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 font-bold ml-1">
                          {currentOrders.length}
                        </span>
                      </h4>
                    </div>

                    {currentOrders.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 font-medium">
                        {t('No active deliveries in progress for this driver.', 'لا توجد طلبات جارية قيد التوصيل لهذا السائق حالياً.')}
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {currentOrders.map((ord) => (
                          <div
                            key={ord.id}
                            className="p-4 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50/40 via-white to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition"
                          >
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900">
                                  #{ord.id.slice(-6).toUpperCase()}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                                  {ord.status === 'SHIPPED' ? t('Out for Delivery', 'جاري التوصيل') : ord.status}
                                </span>
                                <span className="font-mono font-black text-slate-900">
                                  {formatMoney(ord.total, ord.currency)}
                                </span>
                              </div>

                              <p className="font-medium text-slate-700">
                                {ord.user ? `${ord.user.firstName} ${ord.user.lastName}` : ord.customerNameSnapshot || 'Customer'}
                                {ord.user?.phone && (
                                  <span className="text-slate-400 font-mono text-[11px] ml-2">({ord.user.phone})</span>
                                )}
                              </p>

                              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>
                                  {ord.shippingAddressSnapshot?.city}, {ord.shippingAddressSnapshot?.line1}
                                </span>
                              </p>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <Link
                                href={`/admin/orders/${ord.id}`}
                                className="text-[11px] font-bold text-slate-700 hover:text-amber-600 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-2xs"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>{t('View Order', 'عرض الطلب')}</span>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SECTION 2: COMPLETED DELIVERIES */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{t('2. Completed Deliveries History', '2. سجل الطلبات المسلمة بنجاح')}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-bold ml-1">
                          {completedOrders.length}
                        </span>
                      </h4>
                    </div>

                    {completedOrders.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 font-medium">
                        {t('No completed deliveries recorded yet.', 'لم يقم السائق بتسليم أي طلبات بعد.')}
                      </div>
                    ) : (
                      <div className="grid gap-2.5 max-h-64 overflow-y-auto pr-1">
                        {completedOrders.map((ord) => (
                          <div
                            key={ord.id}
                            className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs hover:bg-white transition"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900">
                                  #{ord.id.slice(-6).toUpperCase()}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {t('Delivered', 'تم التوصيل')}
                                </span>
                                <span className="font-mono font-bold text-slate-700">
                                  {formatMoney(ord.total, ord.currency)}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                {ord.user ? `${ord.user.firstName} ${ord.user.lastName}` : ord.customerNameSnapshot} •{' '}
                                {ord.shippingAddressSnapshot?.city}
                              </p>
                            </div>

                            <Link
                              href={`/admin/orders/${ord.id}`}
                              className="text-[10px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                            >
                              <span>{t('Details', 'تفاصيل')}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setViewingDriver(null)}
                className="text-xs px-5 py-2 border-slate-200 cursor-pointer"
              >
                {t('Close', 'إغلاق')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
