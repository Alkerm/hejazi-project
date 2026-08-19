'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  CalendarDays,
  Layers,
  ShoppingBag,
  Package,
  Crown,
  CreditCard,
  Printer,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Award,
} from 'lucide-react';
import { api } from '@/lib/api';
import { AdminSalesAnalytics } from '@/lib/types';
import { formatMoney } from '@/lib/format';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';

type PeriodMode = 'MONTH' | 'YEAR' | 'ALL_TIME' | 'CUSTOM';

const MONTHS = [
  { value: 1, nameEn: 'Jan - January', nameAr: '1 - يناير' },
  { value: 2, nameEn: 'Feb - February', nameAr: '2 - فبراير' },
  { value: 3, nameEn: 'Mar - March', nameAr: '3 - مارس' },
  { value: 4, nameEn: 'Apr - April', nameAr: '4 - أبريل' },
  { value: 5, nameEn: 'May - May', nameAr: '5 - مايو' },
  { value: 6, nameEn: 'Jun - June', nameAr: '6 - يونيو' },
  { value: 7, nameEn: 'Jul - July', nameAr: '7 - يوليو' },
  { value: 8, nameEn: 'Aug - August', nameAr: '8 - أغسطس' },
  { value: 9, nameEn: 'Sep - September', nameAr: '9 - سبتمبر' },
  { value: 10, nameEn: 'Oct - October', nameAr: '10 - أكتوبر' },
  { value: 11, nameEn: 'Nov - November', nameAr: '11 - نوفمبر' },
  { value: 12, nameEn: 'Dec - December', nameAr: '12 - ديسمبر' },
];

export default function AdminAnalyticsPage() {
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const [periodMode, setPeriodMode] = useState<PeriodMode>('MONTH');
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const [data, setData] = useState<AdminSalesAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeHoverBar, setActiveHoverBar] = useState<{
    period: string;
    revenue: number;
    orders: number;
  } | null>(null);

  // Available selectable years (last 5 years + next year)
  const availableYears = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => currentYear - 4 + i).reverse();
  }, [currentYear]);

  // Fetch analytics based on current period settings
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('period', periodMode);

      if (periodMode === 'MONTH') {
        params.set('year', String(selectedYear));
        params.set('month', String(selectedMonth));
      } else if (periodMode === 'YEAR') {
        params.set('year', String(selectedYear));
      } else if (periodMode === 'CUSTOM') {
        if (customStartDate) params.set('startDate', customStartDate);
        if (customEndDate) params.set('endDate', customEndDate);
      }

      const res = await api.adminSalesAnalytics(`?${params.toString()}`);
      setData(res);
    } catch (err) {
      console.error('Failed to load sales analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [periodMode, selectedYear, selectedMonth, customStartDate, customEndDate]);

  // Quick navigation handlers for Month/Year
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleSetThisMonth = () => {
    setPeriodMode('MONTH');
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
  };

  const handleSetLastMonth = () => {
    setPeriodMode('MONTH');
    if (currentMonth === 1) {
      setSelectedYear(currentYear - 1);
      setSelectedMonth(12);
    } else {
      setSelectedYear(currentYear);
      setSelectedMonth(currentMonth - 1);
    }
  };

  const handleSetThisYear = () => {
    setPeriodMode('YEAR');
    setSelectedYear(currentYear);
  };

  const handleSetAllTime = () => {
    setPeriodMode('ALL_TIME');
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Timeline and bar chart calculations
  const timelineData = useMemo(() => {
    if (!data?.timeline) return [];
    return data.timeline;
  }, [data]);

  const maxTimelineRevenue = useMemo(() => {
    if (!timelineData.length) return 1;
    return Math.max(...timelineData.map((d) => d.revenue), 1);
  }, [timelineData]);

  const peakTimelineItem = useMemo(() => {
    if (!timelineData.length) return null;
    return [...timelineData].sort((a, b) => b.revenue - a.revenue)[0];
  }, [timelineData]);

  const maxProductRevenue = useMemo(() => {
    if (!data?.topProducts?.length) return 1;
    return Math.max(...data.topProducts.map((p) => p.revenue), 1);
  }, [data]);

  const maxCustomerSpend = useMemo(() => {
    if (!data?.topCustomers?.length) return 1;
    return Math.max(...data.topCustomers.map((c) => c.totalSpent), 1);
  }, [data]);

  // Payment method label formatter
  const formatPaymentLabel = (method: string, customLabel?: string) => {
    if (customLabel && customLabel !== method) return customLabel;
    switch (method) {
      case 'MADA':
        return t('Mada Card', 'بطاقة مدى البنكية');
      case 'APPLE_PAY':
        return t('Apple Pay', 'أبل باي');
      case 'CREDIT_CARD':
        return t('Credit Card / Visa', 'بطاقة ائتمانية / فيزا');
      case 'COD':
        return t('Cash on Delivery (COD)', 'الدفع عند الاستلام');
      default:
        return method;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 print:p-0 print:space-y-4">
      {/* Header & Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 print:border-b-2 print:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 print:hidden">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="serif-font text-2xl sm:text-3xl font-extrabold text-slate-900">
                {t('Sales Analytics & Executive Reporting', 'تحليلات المبيعات والتقارير التنفيذية')}
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                <span>{t('Active Period:', 'الفترة المحددة:')}</span>
                <span className="font-bold text-amber-600 font-mono">
                  {isRtl ? data?.periodLabel.ar : data?.periodLabel.en}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto print:hidden">
          <Button
            type="button"
            variant="secondary"
            onClick={fetchAnalytics}
            disabled={loading}
            className="text-xs px-3.5 py-2 rounded-xl border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('Refresh', 'تحديث')}</span>
          </Button>

          <Button
            type="button"
            onClick={handlePrintReport}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('Print / Export Report', 'طباعة / تصدير التقرير')}</span>
          </Button>
        </div>
      </div>

      {/* Control Panel: Unified Period Mode Selector & Date Controls */}
      <div className="glass-card rounded-3xl p-5 border border-slate-200/70 bg-white shadow-xs space-y-4 print:hidden">
        {/* Main Period Mode Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 w-fit">
          <button
            type="button"
            onClick={() => setPeriodMode('MONTH')}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              periodMode === 'MONTH'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('Monthly Performance', 'التقرير الشهري')}</span>
          </button>

          <button
            type="button"
            onClick={() => setPeriodMode('YEAR')}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              periodMode === 'YEAR'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
            <span>{t('Annual Performance', 'التقرير السنوي')}</span>
          </button>

          <button
            type="button"
            onClick={() => setPeriodMode('ALL_TIME')}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              periodMode === 'ALL_TIME'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t('All-Time (Store Inception)', 'منذ انطلاق المتجر')}</span>
          </button>

          <button
            type="button"
            onClick={() => setPeriodMode('CUSTOM')}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              periodMode === 'CUSTOM'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-500" />
            <span>{t('Custom Range', 'فترة مخصصة')}</span>
          </button>
        </div>

        {/* Sub-Filters / Integrated Date Controls */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {periodMode === 'MONTH' && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition cursor-pointer"
                  title={t('Previous Month', 'الشهر السابق')}
                >
                  <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                </button>

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-slate-800 px-2 py-1 outline-none cursor-pointer"
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {isRtl ? m.nameAr : m.nameEn}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-slate-800 px-2 py-1 outline-none cursor-pointer font-mono"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition cursor-pointer"
                  title={t('Next Month', 'الشهر القادم')}
                >
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>

              {/* Integrated Quick Presets */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSetThisMonth}
                  className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer border border-slate-200/80"
                >
                  {t('This Month', 'الشهر الحالي')}
                </button>
                <button
                  type="button"
                  onClick={handleSetLastMonth}
                  className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer border border-slate-200/80"
                >
                  {t('Last Month', 'الشهر السابق')}
                </button>
              </div>
            </div>
          )}

          {periodMode === 'YEAR' && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedYear((y) => y - 1)}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition cursor-pointer"
                  title={t('Previous Year', 'العام السابق')}
                >
                  <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                </button>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-slate-800 px-3 py-1 outline-none cursor-pointer font-mono"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {isRtl ? `عام ${y}` : `Year ${y}`}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setSelectedYear((y) => y + 1)}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition cursor-pointer"
                  title={t('Next Year', 'العام القادم')}
                >
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleSetThisYear}
                className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer border border-slate-200/80"
              >
                {t('This Year (2026)', 'العام الحالي (2026)')}
              </button>

              <span className="text-xs text-slate-400 font-medium">
                {t(
                  'Shows month-by-month performance across the 12 months',
                  'عرض المبيعات شهراً بشهر على مدار الـ 12 شهراً'
                )}
              </span>
            </div>
          )}

          {periodMode === 'ALL_TIME' && (
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-semibold text-slate-700">
                {t(
                  'Aggregating complete lifetime sales history since store establishment.',
                  'تجميع شامل لكافة التعاملات والمبيعات منذ انطلاق المتجر.'
                )}
              </span>
            </div>
          )}

          {periodMode === 'CUSTOM' && (
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">{t('From:', 'من:')}</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">{t('To:', 'إلى:')}</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200/60 bg-white shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              {t('Total Sales Revenue', 'إجمالي المبيعات')}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p
            className="text-lg sm:text-xl xl:text-2xl font-black text-slate-900 tracking-tight truncate"
            title={data?.totalRevenue ? formatMoney(data.totalRevenue) : '0 SAR'}
          >
            {loading ? '...' : data?.totalRevenue ? formatMoney(data.totalRevenue) : '0 SAR'}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold">
            {data?.growthRate !== null && data?.growthRate !== undefined ? (
              data.growthRate >= 0 ? (
                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  +{data.growthRate}%
                </span>
              ) : (
                <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  <ArrowDownRight className="w-3 h-3" />
                  {data.growthRate}%
                </span>
              )
            ) : null}
            <span className="text-slate-400 font-medium truncate">
              {periodMode === 'MONTH'
                ? t('vs previous month', 'مقارنة بالشهر السابق')
                : periodMode === 'YEAR'
                ? t('vs previous year', 'مقارنة بالعام السابق')
                : t('total for period', 'إجمالي الفترة')}
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200/60 bg-white shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              {t('Completed Orders', 'عدد الطلبات')}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl xl:text-2xl font-black text-slate-900 truncate">
            {loading ? '...' : (data?.totalOrders ?? 0)}
          </p>
          <p className="text-[11px] text-slate-400 font-medium truncate">
            {t('Successful order transactions', 'طلبات منفذة بنجاح')}
          </p>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200/60 bg-white shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              {t('Avg Order Value (AOV)', 'متوسط قيمة السلة')}
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p
            className="text-lg sm:text-xl xl:text-2xl font-black text-slate-900 tracking-tight truncate"
            title={data?.averageOrderValue ? formatMoney(data.averageOrderValue) : '0 SAR'}
          >
            {loading ? '...' : data?.averageOrderValue ? formatMoney(data.averageOrderValue) : '0 SAR'}
          </p>
          <p className="text-[11px] text-slate-400 font-medium truncate">
            {t('Average spend per checkout', 'متوسط إنفاق العميل للطلب')}
          </p>
        </div>

        {/* Total Units Sold */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200/60 bg-white shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              {t('Units Sold', 'القطع المباعة')}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl xl:text-2xl font-black text-slate-900 truncate">
            {loading ? '...' : (data?.totalUnitsSold ?? 0)}
          </p>
          <p className="text-[11px] text-slate-400 font-medium truncate">
            {t('Total product units fulfilled', 'إجمالي المنتجات المسلّمة')}
          </p>
        </div>
      </div>

      {/* Revenue Trend Visual Graph (Dynamic Timeline Chart) */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/70 bg-white shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              <span>
                {periodMode === 'MONTH'
                  ? t('Daily Sales Trend for Month', 'منحنى المبيعات اليومية للشهر')
                  : periodMode === 'YEAR'
                  ? t('Monthly Sales Trend for Year', 'منحنى المبيعات الشهرية للعام')
                  : t('Sales Revenue Timeline', 'التوزيع الزمني للمبيعات')}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t(
                'Interactive distribution of sales revenue and order volume across the selected period.',
                'رسم تفاعلي يوضح تباين وحجم المبيعات وعدد الطلبات عبر فترات الوقت المحددة.'
              )}
            </p>
          </div>

          {peakTimelineItem && peakTimelineItem.revenue > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/60 self-start sm:self-auto">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <div className="text-[11px]">
                <span className="text-amber-800 font-bold">{t('Peak Period:', 'أعلى ذروة:')} </span>
                <span className="font-mono font-black text-amber-900">
                  {peakTimelineItem.period} ({formatMoney(peakTimelineItem.revenue)})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Visual Chart Area */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-3 border-slate-200 border-t-amber-500"></div>
          </div>
        ) : timelineData.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Calendar className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">
              {t('No sales recorded in this period', 'لا توجد مبيعات مسجلة خلال هذه الفترة')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Hover Tooltip / Detail Callout Bar */}
            <div className="min-h-8 flex items-center justify-between text-xs bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-100">
              {activeHoverBar ? (
                <div className="flex items-center gap-4 font-medium">
                  <span className="text-slate-800 font-bold font-mono">
                    📅 {activeHoverBar.period}
                  </span>
                  <span className="text-slate-600">
                    💰 {t('Revenue:', 'المبيعات:')}{' '}
                    <strong className="text-slate-900 font-mono">
                      {formatMoney(activeHoverBar.revenue)}
                    </strong>
                  </span>
                  <span className="text-slate-600">
                    📦 {t('Orders:', 'الطلبات:')}{' '}
                    <strong className="text-slate-900 font-mono">
                      {activeHoverBar.orders}
                    </strong>
                  </span>
                </div>
              ) : (
                <span className="text-slate-400 italic text-[11px]">
                  {t(
                    'Hover over any bar to view exact revenue and order count for that day/month',
                    'مرر الفأرة فوق أي عمود لعرض تفاصيل المبيعات وعدد الطلبات لذلك اليوم/الشهر'
                  )}
                </span>
              )}
            </div>

            {/* Bars Grid */}
            <div className="relative pt-6 pb-2">
              <div className="flex items-end gap-1.5 sm:gap-2 h-48 sm:h-56 w-full overflow-x-auto pb-4">
                {timelineData.map((item, idx) => {
                  const heightPct = Math.max(
                    Math.round((item.revenue / maxTimelineRevenue) * 100),
                    item.revenue > 0 ? 8 : 2
                  );
                  const isPeak =
                    peakTimelineItem &&
                    peakTimelineItem.period === item.period &&
                    item.revenue > 0;

                  // Format label for x-axis
                  let displayLabel = item.period;
                  if (item.period.includes('-')) {
                    const parts = item.period.split('-');
                    if (parts.length === 3 && parts[2]) {
                      // Day mode (e.g. 2026-08-15 -> 15)
                      displayLabel = parts[2];
                    } else if (parts.length === 2 && parts[1]) {
                      // Month mode (e.g. 2026-08 -> Aug)
                      const mIdx = parseInt(parts[1], 10) - 1;
                      const matchedMonth = MONTHS[mIdx];
                      displayLabel =
                        isRtl && matchedMonth
                          ? matchedMonth.nameAr.split(' - ')[1] || parts[1]
                          : matchedMonth
                          ? matchedMonth.nameEn.split(' - ')[0] || parts[1]
                          : parts[1];
                    }
                  }

                  return (
                    <div
                      key={item.period || idx}
                      onMouseEnter={() => setActiveHoverBar(item)}
                      onMouseLeave={() => setActiveHoverBar(null)}
                      className="flex-1 min-w-[20px] max-w-[48px] flex flex-col items-center gap-1.5 group cursor-pointer h-full justify-end"
                    >
                      {/* Bar Container */}
                      <div className="w-full h-full flex items-end justify-center relative">
                        {isPeak && (
                          <span className="absolute -top-6 text-[9px] font-black bg-amber-500 text-slate-950 px-1 py-0.5 rounded shadow-2xs uppercase whitespace-nowrap animate-bounce">
                            ★ Peak
                          </span>
                        )}
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            isPeak
                              ? 'bg-amber-500 group-hover:bg-amber-600 shadow-md shadow-amber-500/30'
                              : item.revenue > 0
                              ? 'bg-slate-800 group-hover:bg-amber-500'
                              : 'bg-slate-200/70 group-hover:bg-slate-300'
                          }`}
                        />
                      </div>

                      {/* X-axis Label */}
                      <span
                        className={`text-[10px] font-mono text-center truncate w-full ${
                          isPeak
                            ? 'font-bold text-amber-700'
                            : 'text-slate-400 group-hover:text-slate-800'
                        }`}
                      >
                        {displayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Grid: Top Products & Top Customers */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Performing Products Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/70 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{t('Best Sellers of the Period', 'المنتجات الأكثر مبيعاً في هذه الفترة')}</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              {data?.topProducts?.length ?? 0} {t('products', 'منتجات')}
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500"></div>
            </div>
          ) : !data?.topProducts?.length ? (
            <div className="py-10 text-center text-slate-400 text-xs font-medium">
              {t('No product sales recorded in this period', 'لا توجد منتجات مباعة في هذه الفترة')}
            </div>
          ) : (
            <div className="space-y-3.5">
              {data.topProducts.map((item, index) => {
                const widthPct = Math.min((item.revenue / maxProductRevenue) * 100, 100);
                const rank = index + 1;
                const isTop1 = rank === 1;

                return (
                  <div key={item.productId || index} className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center font-medium">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                            isTop1
                              ? 'bg-amber-400 text-slate-950 shadow-2xs'
                              : rank === 2
                              ? 'bg-slate-200 text-slate-800'
                              : rank === 3
                              ? 'bg-amber-700/80 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {rank}
                        </span>
                        <span className="text-slate-800 font-bold truncate">
                          {item.productName}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900 font-mono">
                          {formatMoney(item.revenue)}
                        </span>
                        <span className="text-slate-400 font-medium text-[11px] block">
                          {item.unitsSold} {t('units', 'قطعة')}
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTop1 ? 'bg-amber-500' : 'bg-slate-700'
                        }`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Spending Customers Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/70 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>{t('Top Customers of the Period', 'أبرز العملاء خلال الفترة')}</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              {data?.topCustomers?.length ?? 0} {t('VIP Buyers', 'عميل')}
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500"></div>
            </div>
          ) : !data?.topCustomers?.length ? (
            <div className="py-10 text-center text-slate-400 text-xs font-medium">
              {t('No customer orders in this period', 'لا توجد طلبات عملاء في هذه الفترة')}
            </div>
          ) : (
            <div className="space-y-3.5">
              {data.topCustomers.map((customer, index) => {
                const widthPct = Math.min((customer.totalSpent / maxCustomerSpend) * 100, 100);
                const rank = index + 1;

                return (
                  <div key={customer.userId || index} className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center font-medium">
                      <div className="min-w-0 pr-2">
                        <span className="text-slate-800 font-bold truncate block">
                          #{rank} {customer.customerName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono truncate block">
                          {customer.email ?? t('No email', 'بدون بريد')}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900 font-mono">
                          {formatMoney(customer.totalSpent)}
                        </span>
                        <span className="text-slate-400 font-medium text-[11px] block">
                          {customer.ordersCount} {t('orders', 'طلب')}
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Payment Channels Breakdown */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/70 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>{t('Payment Methods Distribution', 'توزيع قنوات وطرق الدفع')}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t(
                'Breakdown of customer payment channels (Mada, Apple Pay, Credit Card, COD)',
                'نسبة استخدام قنوات السداد المختلفة في الفترة المحددة'
              )}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500"></div>
          </div>
        ) : !data?.paymentMethods?.length ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium">
            {t('No payment records for this period', 'لا توجد بيانات دفع مسجلة لهذه الفترة')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {data.paymentMethods.map((pm, idx) => (
              <div
                key={pm.method || idx}
                className="p-4 rounded-2xl border border-slate-200/60 bg-slate-50/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {formatPaymentLabel(pm.method, pm.label)}
                  </span>
                  <span className="text-xs font-black text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                    {pm.percentage}%
                  </span>
                </div>

                <p className="text-base font-black text-slate-900 font-mono">
                  {formatMoney(pm.revenue)}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{pm.ordersCount} {t('orders', 'طلبات')}</span>
                  <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${pm.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Print-Only Footer */}
      <div className="hidden print:block text-center text-xs text-slate-500 pt-8 border-t border-slate-200">
        <p>
          {t(
            'Official Executive Sales Analytics Report - Halflink E-Commerce Platform',
            'تقرير المبيعات والتحليلات التنفيذية المعتمد - منصة هاف لينك'
          )}
        </p>
        <p className="font-mono mt-1">Generated at: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
