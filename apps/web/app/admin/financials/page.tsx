'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Boxes,
  PieChart,
  Search,
  RefreshCw,
  Save,
  Check,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { Category, AdminFinancialOverviewResponse, ProductFinancialItem } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';
import { formatMoney } from '@/lib/format';
import { Button } from '@/components/ui/button';

export default function AdminFinancialsPage() {
  const { t, formatProductName, formatCategoryName } = useLanguage();
  const [data, setData] = useState<AdminFinancialOverviewResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'profit' | 'margin' | 'revenue' | 'stock' | 'cost' | 'price' | 'name'>('profit');

  // Inline Editing State: Map<productId, { costPrice: string | number, price: string | number }>
  const [editedPrices, setEditedPrices] = useState<Record<string, { costPrice: string | number; price: string | number }>>({});
  const [savingProductId, setSavingProductId] = useState<string | null>(null);

  const loadFinancials = async (showRefreshToast = false) => {
    if (showRefreshToast) setRefreshing(true);
    else setLoading(true);

    try {
      const [finRes, catRes] = await Promise.all([
        api.adminGetFinancials({
          search: search.trim() || undefined,
          categoryId: selectedCategory || undefined,
          sortBy,
        }),
        api.adminCategories().catch(() => []),
      ]);

      setData(finRes);
      setCategories(catRes);

      // Initialize inline edit state from received products
      const initialEdits: Record<string, { costPrice: string | number; price: string | number }> = {};
      for (const p of finRes.products) {
        initialEdits[p.id] = { costPrice: p.costPrice, price: p.price };
      }
      setEditedPrices(initialEdits);

      if (showRefreshToast) {
        toast.success(t('Financial records refreshed!', 'تم تحديث البيانات المالية بنجاح!'));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load financial records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFinancials();
  }, [selectedCategory, sortBy]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      loadFinancials();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCostChange = (productId: string, val: string | number) => {
    setEditedPrices((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { costPrice: 0, price: 0 }),
        costPrice: val === '' ? '' : Number(val) >= 0 ? val : 0,
      },
    }));
  };

  const handlePriceChange = (productId: string, val: string | number) => {
    setEditedPrices((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { costPrice: 0, price: 0 }),
        price: val === '' ? '' : Number(val) >= 0 ? val : 0,
      },
    }));
  };

  const handleSaveProductFinancials = async (product: ProductFinancialItem) => {
    const edit = editedPrices[product.id];
    if (!edit) return;

    const numCost = edit.costPrice === '' ? 0 : Number(edit.costPrice);
    const numPrice = edit.price === '' ? 0 : Number(edit.price);

    setSavingProductId(product.id);
    try {
      await api.adminUpdateProductFinancials(product.id, {
        costPrice: numCost,
        price: numPrice,
      });

      toast.success(
        t(
          `Updated "${formatProductName(product)}": Cost SAR ${numCost} | Price SAR ${numPrice}`,
          `تم تحديث "${formatProductName(product)}": التكلفة ${numCost} ر.س | البيع ${numPrice} ر.س`
        )
      );

      // Refresh data silently to recompute overall totals
      await loadFinancials();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update financial values');
    } finally {
      setSavingProductId(null);
    }
  };

  const handleResetProduct = (product: ProductFinancialItem) => {
    setEditedPrices((prev) => ({
      ...prev,
      [product.id]: { costPrice: product.costPrice, price: product.price },
    }));
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Toaster position="top-center" richColors />
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500"></div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 animate-pulse">
          {t('Loading Financial Wallet & Ledger...', 'جاري تحميل المحفظة المالية وسجل الأرباح...')}
        </p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalRevenue: 0,
    totalCostOfGoodsSold: 0,
    netRealizedProfit: 0,
    overallMarginPercentage: 0,
    inventoryTotalCostValue: 0,
    inventoryTotalRetailValue: 0,
    expectedInventoryProfit: 0,
    totalOrdersCount: 0,
    totalUnitsSoldAll: 0,
    totalInStockUnits: 0,
    activeProductsCount: 0,
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-7xl mx-auto">
      <Toaster position="top-center" richColors />

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-md">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="serif-font text-2xl sm:text-3xl font-black text-slate-900">
                {t('Financial Wallet & Profit Analysis', 'المحفظة المالية وتحليلات الأرباح')}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'Track total store revenue, cost of goods, net realized profit, and inventory asset valuation',
                  'متابعة الدخل الإجمالي، تكاليف المنتجات، صافي الأرباح المحققة، وقيمة الأصول والمخزون'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => loadFinancials(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-bold border-slate-200 hover:bg-slate-50 rounded-xl px-4 py-2 shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? t('Refreshing...', 'جاري التحديث...') : t('Refresh Ledger', 'تحديث الأرقام')}</span>
          </Button>

          <Link href="/admin/products/new">
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer">
              <span>+ {t('Add New Product', 'إضافة منتج جديد')}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Top Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Total Realized Revenue */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/60 bg-gradient-to-br from-white via-white to-slate-50/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
              {t('Total Income / Revenue', 'إجمالي الدخل المحصل')}
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900">
              {formatMoney(metrics.totalRevenue)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="font-bold text-slate-700">{metrics.totalOrdersCount}</span> {t('paid customer orders', 'طلبات مدفوعة')}
          </div>
        </div>

        {/* Card 2: Cost of Goods Sold (COGS) */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/60 bg-gradient-to-br from-white via-white to-slate-50/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
              {t('Cost of Goods Sold (COGS)', 'إجمالي تكلفة المبيعات')}
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900">
              {formatMoney(metrics.totalCostOfGoodsSold)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="font-bold text-slate-700">{metrics.totalUnitsSoldAll}</span> {t('units fulfilled & delivered', 'قطعة تم بيعها وتوريدها')}
          </div>
        </div>

        {/* Card 3: Net Realized Profit */}
        <div className="glass-card rounded-3xl p-6 border border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 via-white to-white shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800">
              {t('Net Realized Profit', 'صافي الأرباح المحققة')}
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-mono font-black text-emerald-900">
              +{metrics.overallMarginPercentage}% {t('Margin', 'هامش')}
            </span>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-800">
              {formatMoney(metrics.netRealizedProfit)}
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-medium">
            ✓ {t('Net cash profit generated from delivered sales', 'صافي الأرباح الفعلية الناتجة عن المبيعات')}
          </div>
        </div>

        {/* Card 4: Inventory Asset Value at Cost */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/60 bg-gradient-to-br from-white via-white to-slate-50/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
              {t('Inventory Asset (At Cost)', 'قيمة المخزون بسعر التكلفة')}
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900">
              {formatMoney(metrics.inventoryTotalCostValue)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="font-bold text-slate-700">{metrics.totalInStockUnits}</span> {t('units available in stock', 'قطعة متوفرة حالياً بالمستودع')}
          </div>
        </div>

        {/* Card 5: Expected Profit from In-Stock */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/60 bg-gradient-to-br from-white via-white to-slate-50/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
              {t('Expected Profit (Remaining Stock)', 'الأرباح المتوقعة للمخزون')}
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl sm:text-3xl font-black text-purple-950">
              {formatMoney(metrics.expectedInventoryProfit)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {t('Retail value:', 'القيمة البيعية:')} <strong className="text-slate-700 font-mono">{formatMoney(metrics.inventoryTotalRetailValue)}</strong>
          </div>
        </div>

        {/* Card 6: Catalog & Margin Overview */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/60 bg-gradient-to-br from-white via-white to-slate-50/50 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
              {t('Store Profit Margin Ratio', 'معدل ربحية المتجر')}
            </span>
            <div className="p-2.5 rounded-xl bg-slate-900 text-amber-400 border border-amber-500/30">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900">
              {metrics.overallMarginPercentage}%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {t('Active Products Catalog:', 'المنتجات النشطة:')} <strong className="text-slate-800">{metrics.activeProductsCount}</strong>
          </div>
        </div>
      </div>

      {/* Interactive Financial Ledger & Product Matrix */}
      <div className="glass-card rounded-3xl border border-slate-200/70 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Table Controls & Filters Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t('Product Unit Economics & Profit Ledger', 'سجل تسعير وتكاليف وأرباح المنتجات')}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-bold">
                {data?.products.length || 0} {t('products', 'منتج')}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t(
                'Edit Cost or Selling Price inline below and click Save to synchronize changes across the store immediately.',
                'يمكنك تعديل سعر التكلفة أو سعر البيع مباشرة من الجدول والضغط على حفظ للمزامنة الفورية.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex items-center min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:right-3.5 rtl:left-auto" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('Search by Name, SKU, ID...', 'ابحث بالاسم، الكود، المعرف...')}
                className="pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 w-full font-medium"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">{t('All Categories', 'جميع الفئات')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {formatCategoryName(c)}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="profit">{t('Highest Unit Profit', 'الأعلى ربحاً للقطعة')}</option>
                <option value="margin">{t('Highest Margin %', 'الأعلى نسبة هامش %')}</option>
                <option value="revenue">{t('Highest Realized Revenue', 'الأعلى إيراداً محققاً')}</option>
                <option value="stock">{t('Stock Quantity', 'كمية المخزون')}</option>
                <option value="cost">{t('Cost: High to Low', 'التكلفة: من الأعلى للأقل')}</option>
                <option value="price">{t('Price: High to Low', 'سعر البيع: من الأعلى للأقل')}</option>
                <option value="name">{t('Alphabetical: A-Z', 'أبجدي: أ-ي')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-600 border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3.5 rounded-l-2xl rtl:rounded-l-none rtl:rounded-r-2xl">
                  {t('Product / Item', 'المنتج')}
                </th>
                <th className="px-3 py-3.5">{t('Cost Price (SAR)', 'سعر التكلفة')}</th>
                <th className="px-3 py-3.5">{t('Selling Price (SAR)', 'سعر البيع')}</th>
                <th className="px-3 py-3.5 text-center">{t('Unit Profit', 'ربح القطعة')}</th>
                <th className="px-3 py-3.5 text-center">{t('Margin %', 'هامش الربح %')}</th>
                <th className="px-3 py-3.5 text-center">{t('In Stock', 'المخزون')}</th>
                <th className="px-3 py-3.5">{t('Stock Asset Value', 'قيمة التكلفة')}</th>
                <th className="px-3 py-3.5">{t('Potential Profit', 'الربح المتوقع')}</th>
                <th className="px-3 py-3.5 text-center">{t('Units Sold', 'المبيعات')}</th>
                <th className="px-3 py-3.5">{t('Realized Profit', 'الربح المحقق')}</th>
                <th className="px-4 py-3.5 text-center rounded-r-2xl rtl:rounded-r-none rtl:rounded-l-2xl">
                  {t('Actions', 'الإجراء')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.products.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-slate-400 font-medium">
                    {t('No products found matching the criteria.', 'لا توجد منتجات مطابقة لخيارات البحث.')}
                  </td>
                </tr>
              ) : (
                data?.products.map((product) => {
                  const currentEdit = editedPrices[product.id] || {
                    costPrice: product.costPrice,
                    price: product.price,
                  };

                  const numCost = currentEdit.costPrice === '' ? 0 : Number(currentEdit.costPrice);
                  const numPrice = currentEdit.price === '' ? 0 : Number(currentEdit.price);

                  const isModified =
                    numCost !== product.costPrice || numPrice !== product.price;

                  const liveUnitProfit = numPrice - numCost;
                  const liveMargin =
                    numPrice > 0 ? (liveUnitProfit / numPrice) * 100 : 0;
                  const liveStockProfit = product.stockQuantity * liveUnitProfit;
                  const isSavingThis = savingProductId === product.id;

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isModified ? 'bg-amber-50/30 font-medium' : ''
                      }`}
                    >
                      {/* Product Thumbnail & Details */}
                      <td className="px-4 py-3.5 min-w-[220px]">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="space-y-0.5 max-w-[200px]">
                            <p className="font-extrabold text-slate-900 line-clamp-1 text-xs">
                              {formatProductName(product)}
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                                {formatCategoryName(product.category)}
                              </span>
                              {product.sku && (
                                <span className="text-[9px] font-mono text-slate-400">
                                  SKU: {product.sku}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cost Price (Editable) */}
                      <td className="px-3 py-3.5 min-w-[110px]">
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={currentEdit.costPrice}
                            onFocus={(e) => {
                              if (e.target.value === '0') {
                                e.target.select();
                              }
                            }}
                            onBlur={() => {
                              if (currentEdit.costPrice === '' || isNaN(Number(currentEdit.costPrice))) {
                                handleCostChange(product.id, 0);
                              }
                            }}
                            onChange={(e) => handleCostChange(product.id, e.target.value)}
                            className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-mono font-bold text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </td>

                      {/* Selling Price (Editable) */}
                      <td className="px-3 py-3.5 min-w-[110px]">
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={currentEdit.price}
                            onFocus={(e) => {
                              if (e.target.value === '0') {
                                e.target.select();
                              }
                            }}
                            onBlur={() => {
                              if (currentEdit.price === '' || isNaN(Number(currentEdit.price))) {
                                handlePriceChange(product.id, 0);
                              }
                            }}
                            onChange={(e) => handlePriceChange(product.id, e.target.value)}
                            className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </td>

                      {/* Unit Profit */}
                      <td className="px-3 py-3.5 text-center font-mono">
                        <span
                          className={`inline-flex items-center gap-1 font-black text-xs px-2.5 py-0.5 rounded-md ${
                            liveUnitProfit >= 0
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                          }`}
                        >
                          <span>{liveUnitProfit >= 0 ? '+' : ''}{liveUnitProfit.toFixed(2)}</span>
                          <span className="text-[10px] opacity-80">{t('SAR', 'ر.س')}</span>
                        </span>
                      </td>

                      {/* Margin % */}
                      <td className="px-3 py-3.5 text-center font-mono">
                        <span
                          className={`inline-block font-extrabold text-[11px] px-2 py-0.5 rounded-full ${
                            liveMargin >= 40
                              ? 'bg-emerald-100 text-emerald-900'
                              : liveMargin >= 20
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {liveMargin.toFixed(1)}%
                        </span>
                      </td>

                      {/* In Stock */}
                      <td className="px-3 py-3.5 text-center">
                        <span
                          className={`inline-block font-mono font-extrabold text-xs ${
                            product.stockQuantity <= 5 ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {product.stockQuantity}
                        </span>
                      </td>

                      {/* Stock Asset Cost */}
                      <td className="px-3 py-3.5 font-mono text-slate-700 font-bold whitespace-nowrap">
                        {formatMoney(product.stockQuantity * numCost)}
                      </td>

                      {/* Potential Stock Profit */}
                      <td className="px-3 py-3.5 font-mono text-purple-950 font-black whitespace-nowrap">
                        {formatMoney(liveStockProfit)}
                      </td>

                      {/* Units Sold */}
                      <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-800">
                        {product.unitsSold}
                      </td>

                      {/* Realized Profit */}
                      <td className="px-3 py-3.5 font-mono font-black text-emerald-800 whitespace-nowrap">
                        {formatMoney(product.realizedProfit)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleSaveProductFinancials(product)}
                            disabled={isSavingThis}
                            title={t('Save cost and price changes', 'حفظ تعديلات السعر والتكلفة')}
                            className={`flex items-center gap-1.5 font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer ${
                              isModified
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/30'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                            }`}
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{isSavingThis ? t('Saving...', 'جاري الحفظ...') : t('Save', 'حفظ')}</span>
                          </button>

                          {isModified && (
                            <button
                              onClick={() => handleResetProduct(product)}
                              title={t('Reset changes', 'تراجع عن التعديل')}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
