'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Megaphone,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Mail,
  Phone,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Award,
  Crown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  X,
  Eye,
  Loader2,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import { api } from '@/lib/api';
import {
  AdminCustomersOverviewResponse,
  CustomerDirectoryItem,
  TopCustomerItem,
  AdminBroadcastEmailPayload,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/language-context';
import { formatMoney } from '@/lib/format';
import { toast, Toaster } from 'sonner';

export default function AdminCustomersPage() {
  const { t, lang } = useLanguage();
  const [data, setData] = useState<AdminCustomersOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('USER');
  const [marketingOnly, setMarketingOnly] = useState(false);
  const [page, setPage] = useState(1);

  // Leaderboard Tab: 'SPENDING' or 'ORDERS'
  const [leaderboardTab, setLeaderboardTab] = useState<'SPENDING' | 'ORDERS'>('SPENDING');

  // Broadcast Announcement Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState<AdminBroadcastEmailPayload>({
    audience: 'ALL',
    subject: '',
    title: '',
    message: '',
    callToActionUrl: 'https://halflink.sa/products',
    callToActionLabel: 'Shop Latest Arrivals / تسوق الآن',
  });
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.adminCustomersOverview({
        page,
        pageSize: 15,
        search: search.trim() || undefined,
        role: (roleFilter as any) || undefined,
        marketingOnly: marketingOnly || undefined,
      });
      setData(res);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, roleFilter, marketingOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.subject.trim() || !broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      toast.error(t('Please complete the subject, title, and message fields', 'يرجى تعبئة كافة حقول الرسالة والموضوع'));
      return;
    }

    setSendingBroadcast(true);
    try {
      const res = await api.adminSendBroadcastEmail(broadcastForm);
      toast.success(
        t(
          `Announcement broadcast sent to ${res.recipientCount} customer(s)!`,
          `تم إرسال الإعلان الجماعي بنجاح إلى ${res.recipientCount} عميل!`
        )
      );
      setIsBroadcastModalOpen(false);
      setBroadcastForm({
        audience: 'ALL',
        subject: '',
        title: '',
        message: '',
        callToActionUrl: 'https://halflink.sa/products',
        callToActionLabel: 'Shop Latest Arrivals / تسوق الآن',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to send broadcast email');
    } finally {
      setSendingBroadcast(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <Toaster position="top-right" richColors />

      {/* Page Header with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="serif-font text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-amber-500" />
            <span>{t('Customer Base & Announcements', 'قاعدة العملاء والرسائل العامة')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t(
              'Analyze registered customer metrics, review top VIP buyers, and send broadcast announcement emails.',
              'متابعة حسابات وإحصائيات العملاء، قائمة كبار المشترين، وإرسال النشرات والإعلانات العامة عبر البريد.'
            )}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsBroadcastModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Megaphone className="w-4 h-4 text-slate-950" />
          <span>{t('Send Broadcast Announcement', 'إرسال إعلان جماعي للعملاء')}</span>
        </Button>
      </div>

      {/* Top Value-Add Insight KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Registered Customers */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200/60 bg-white shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              {t('Customers', 'إجمالي العملاء')}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            {data?.metrics.totalCustomers ?? (loading ? '...' : 0)}
          </p>
          <p className="text-[10px] text-slate-400 font-medium truncate">
            {t('Registered Accounts', 'حساب مسجل')}
          </p>
        </div>

        {/* Total Orders Placed */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200/60 bg-white shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              {t('Total Orders', 'إجمالي الطلبات')}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            {data?.metrics.totalOrders ?? (loading ? '...' : 0)}
          </p>
          <p className="text-[10px] text-slate-400 font-medium truncate">
            {t('All time orders', 'طلب منفذ')}
          </p>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200/60 bg-white shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              {t('Avg Order (AOV)', 'متوسط الطلب')}
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p
            className="text-base sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight truncate"
            title={data?.metrics.averageOrderValue ? formatMoney(data.metrics.averageOrderValue) : '0 SAR'}
          >
            {data?.metrics.averageOrderValue ? formatMoney(data.metrics.averageOrderValue) : '0 SAR'}
          </p>
          <p className="text-[10px] text-slate-400 font-medium truncate">
            {t('Per basket average', 'متوسط قيمة السلة')}
          </p>
        </div>

        {/* Marketing Consented Opt-Ins */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200/60 bg-white shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              {t('Newsletter Reach', 'مشتركو النشرات')}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            {data?.metrics.marketingConsentedCount ?? (loading ? '...' : 0)}
          </p>
          <p className="text-[10px] text-slate-400 font-medium truncate">
            {t('Opted-in for emails', 'موافقون على العروض')}
          </p>
        </div>

        {/* Active Buyers */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200/60 bg-white shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              {t('Active Buyers', 'العملاء المشترون')}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            {data?.metrics.activeBuyersCount ?? (loading ? '...' : 0)}
          </p>
          <p className="text-[10px] text-slate-400 font-medium truncate">
            {t('Completed >= 1 order', 'قاموا بالطلب')}
          </p>
        </div>
      </div>

      {/* Top Customers Leaderboard (Two Ranking Modes) */}
      <div className="glass-card rounded-3xl border border-slate-200/70 bg-white shadow-sm overflow-hidden space-y-4 p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {t('VIP Customer Leaderboard', 'قائمة كبار العملاء الأكثر شراءً')}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t(
                  'Recognize high-value patrons based on total spend or order count frequency.',
                  'التعرف على العملاء الأكثر ولاءً حسب إجمالي المبالغ المدفوعة أو تكرار الطلبات.'
                )}
              </p>
            </div>
          </div>

          {/* Ranking Mode Toggle Buttons */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/60 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setLeaderboardTab('SPENDING')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                leaderboardTab === 'SPENDING'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('By Total Spent (SAR)', 'الأعلى إنفاقاً (بالريال)')}</span>
            </button>
            <button
              type="button"
              onClick={() => setLeaderboardTab('ORDERS')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                leaderboardTab === 'ORDERS'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
              <span>{t('By Order Count', 'الأكثر طلباً (عدد الطلبات)')}</span>
            </button>
          </div>
        </div>

        {/* Leaderboard Table / Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {((leaderboardTab === 'SPENDING' ? data?.topBySpending : data?.topByOrders) || []).map(
              (customer, idx) => {
                const rank = idx + 1;
                const isTop1 = rank === 1;
                const isTop2 = rank === 2;
                const isTop3 = rank === 3;

                return (
                  <div
                    key={customer.userId}
                    className={`rounded-2xl p-4 border transition-all relative overflow-hidden flex flex-col justify-between ${
                      isTop1
                        ? 'bg-gradient-to-br from-amber-50 via-white to-amber-50/30 border-amber-300 shadow-xs'
                        : isTop2
                        ? 'bg-gradient-to-br from-slate-50 via-white to-slate-100/40 border-slate-300'
                        : isTop3
                        ? 'bg-gradient-to-br from-orange-50/40 via-white to-orange-50/20 border-orange-200'
                        : 'bg-white border-slate-200/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-sm ${
                            isTop1
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : isTop2
                              ? 'bg-slate-300 text-slate-800'
                              : isTop3
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          #{rank}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{customer.customerName}</h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {customer.email}
                          </p>
                        </div>
                      </div>

                      {isTop1 && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-700" />
                          VIP #1
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                          {t('Total Spend', 'إجمالي الشراء')}
                        </span>
                        <span className="font-mono font-black text-slate-900">
                          {formatMoney(customer.totalSpent)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                          {t('Completed Orders', 'الطلبات المنفذة')}
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {customer.ordersCount} {t('orders', 'طلبات')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* Registered Accounts Directory (Privacy-Safe View) */}
      <div className="glass-card rounded-3xl border border-slate-200/70 bg-white shadow-sm overflow-hidden space-y-4 p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>{t('Registered Accounts Directory', 'سجل حسابات العملاء المسجلين')}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t(
                'Privacy-governed customer records (passwords & sensitive credentials are kept confidential).',
                'عرض بيانات الاتصال وحجم التعاملات وفق ضوابط الخصوصية النظامية.'
              )}
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('Search name, email, phone...', 'البحث بالاسم، الإيميل، الجوال...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 w-64 bg-slate-50/50"
              />
            </div>
            <Button type="submit" variant="secondary" className="text-xs py-2 px-3 border-slate-200">
              {t('Search', 'بحث')}
            </Button>
          </form>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-600">
                <th className="py-3 px-4 font-bold">{t('Customer Name', 'اسم العميل')}</th>
                <th className="py-3 px-4 font-bold">{t('Email & Phone', 'البريد والجوال')}</th>
                <th className="py-3 px-4 font-bold">{t('City / Location', 'المدينة والموقع')}</th>
                <th className="py-3 px-4 font-bold">{t('Registered', 'تاريخ التسجيل')}</th>
                <th className="py-3 px-4 font-bold">{t('Orders', 'الطلبات')}</th>
                <th className="py-3 px-4 font-bold">{t('Total Spent', 'إجمالي الشراء')}</th>
                <th className="py-3 px-4 font-bold">{t('Newsletter', 'النشرات')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" />
                  </td>
                </tr>
              ) : data?.directory.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 italic">
                    {t('No registered customers found matching criteria.', 'لم يتم العثور على عملاء مطابقين للبحث.')}
                  </td>
                </tr>
              ) : (
                data?.directory.items.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {cust.firstName} {cust.lastName}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {cust.id.slice(-6)}</span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {cust.email}
                      </div>
                      {cust.phone && (
                        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span dir="ltr">{cust.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {cust.city ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{cust.city}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">{t('Not set', 'غير محدد')}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(cust.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800 font-mono">
                      {cust.totalOrders}
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900 font-mono">
                      {formatMoney(cust.totalSpent)}
                    </td>

                    <td className="py-3.5 px-4">
                      {cust.marketingConsent ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {t('Opted In', 'مشترك')}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {t('Standard', 'افتراضي')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {data && data.directory.meta.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              {t('Page', 'صفحة')} {data.directory.meta.page} {t('of', 'من')}{' '}
              {data.directory.meta.totalPages} ({data.directory.meta.total} {t('total customers', 'إجمالي العملاء')})
            </span>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="text-xs px-3 py-1.5 border-slate-200"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{t('Previous', 'السابق')}</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={page >= data.directory.meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="text-xs px-3 py-1.5 border-slate-200"
              >
                <span>{t('Next', 'التالي')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Broadcast Announcement Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {t('Send Customer Public Announcement', 'إرسال إعلان عام / نشرة للعملاء')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('Compose a broadcast email dispatched to selected customer segment.', 'صياغة وإرسال رسالة إعلانية تصل لصناديق البريد لعملائك.')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSendBroadcast} className="space-y-4">
              {/* Target Audience Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {t('Target Audience Segment *', 'الشريحة المستهدفة من العملاء *')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'ALL', label: t('All Customers', 'جميع العملاء المسجلين') },
                    { key: 'MARKETING_ONLY', label: t('Marketing Subscribers', 'مشتركو النشرات والعروض') },
                    { key: 'VIP_ONLY', label: t('VIP & Active Buyers', 'العملاء المشترون (VIP)') },
                  ].map((aud) => (
                    <button
                      key={aud.key}
                      type="button"
                      onClick={() => setBroadcastForm({ ...broadcastForm, audience: aud.key as any })}
                      className={`p-3 rounded-xl border text-xs font-bold text-left sm:text-center transition ${
                        broadcastForm.audience === aud.key
                          ? 'border-amber-500 bg-amber-50/70 text-amber-950 shadow-2xs'
                          : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {aud.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Line */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {t('Email Subject Line *', 'عنوان الرسالة في البريد (Subject) *')}
                </label>
                <Input
                  required
                  placeholder={t('e.g. Exclusive Offers & New Arrivals at Hejazi Store!', 'مثال: عروض حصرية ومنتجات جديدة بمتجر حجازي!')}
                  value={broadcastForm.subject}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, subject: e.target.value })}
                />
              </div>

              {/* Announcement Headline / Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {t('Announcement Headline (Inside Email) *', 'المانشيت الرئيسي داخل الإعلان *')}
                </label>
                <Input
                  required
                  placeholder={t('e.g. Special 15% Discount on Beauty Care Collections', 'مثال: خصم خاص 15% على باقات التجميل والعطور')}
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                />
              </div>

              {/* Message Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    {t('Announcement Message Body *', 'نص ومحتوى الإعلان *')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEmailPreview(!showEmailPreview)}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showEmailPreview ? t('Hide Live Preview', 'إخفاء المعاينة') : t('Show Email Preview', 'معاينة شكل الإيميل')}</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder={t('Write your public announcement details, discounts, new features, or greeting...', 'اكتب تفاصيل الإعلان، تفاصيل الخصم، المنتجات الجديدة...')}
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full text-xs font-medium px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50 leading-relaxed resize-none"
                />
              </div>

              {/* Call to action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {t('Action Button Label', 'نص زر التوجيه')}
                  </label>
                  <Input
                    value={broadcastForm.callToActionLabel}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, callToActionLabel: e.target.value })}
                    placeholder="Shop Now / تسوق الآن"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {t('Button URL Link', 'رابط زر التوجيه')}
                  </label>
                  <Input
                    value={broadcastForm.callToActionUrl}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, callToActionUrl: e.target.value })}
                    placeholder="https://halflink.sa/products"
                  />
                </div>
              </div>

              {/* Live Email Preview Container */}
              {showEmailPreview && (
                <div className="p-4 rounded-2xl border border-amber-200/80 bg-slate-900 text-white space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      {t('Inbox Email Preview', 'معاينة شكل الإيميل المستلم')}
                    </span>
                    <span className="text-[10px] text-slate-400">From: support@halflink.sa</span>
                  </div>

                  <div className="bg-white text-slate-900 rounded-xl p-5 space-y-4">
                    {/* Brand Banner */}
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-950 text-amber-400 font-mono font-bold flex items-center justify-center text-xs">
                        HL
                      </div>
                      <div>
                        <span className="font-bold text-sm block leading-none">HALF LINK</span>
                        <span className="text-[8px] tracking-widest text-amber-600 font-bold uppercase">HEJAZI COSMETICS</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-base font-extrabold text-slate-900">{broadcastForm.title || 'Announcement Title'}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {broadcastForm.message || 'Announcement message content will appear here.'}
                      </p>
                    </div>

                    {broadcastForm.callToActionLabel && (
                      <div className="pt-2">
                        <span className="inline-block bg-amber-500 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl shadow-xs">
                          {broadcastForm.callToActionLabel}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-400">
                      You are receiving this email as a registered customer of Half Link Hejazi Store.
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  disabled={sendingBroadcast}
                  className="text-xs border-slate-200"
                >
                  {t('Cancel', 'إلغاء')}
                </Button>
                <Button
                  type="submit"
                  disabled={sendingBroadcast}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {sendingBroadcast ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <Send className="w-4 h-4 text-slate-950" />
                  )}
                  <span>{sendingBroadcast ? t('Sending Broadcast...', 'جاري الإرسال...') : t('Send Email Broadcast', 'إرسال الإعلان للعملاء')}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
