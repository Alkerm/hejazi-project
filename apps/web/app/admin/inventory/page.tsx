'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  ArrowRight,
  RefreshCw,
  Truck,
  Layers,
  Sparkles,
  SlidersHorizontal,
  X,
  Loader2,
  Box,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';
import { toast, Toaster } from 'sonner';

type StockFilterTab = 'ALL' | 'LOW' | 'OUT' | 'HEALTHY';

export default function AdminInventoryPage() {
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<StockFilterTab>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Restock Modal State
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState<number>(0);
  const [restockNote, setRestockNote] = useState<string>('');
  const [submittingRestock, setSubmittingRestock] = useState(false);

  const loadInventory = async () => {
    setLoading(true);
    try {
      // Fetch products (pageSize=50 works reliably across all API deployments)
      const res = await api.adminProducts('?page=1&pageSize=50');
      let allItems = res?.items || [];

      // If total items exceed first page, fetch remaining pages concurrently
      if (res?.meta?.totalPages && res.meta.totalPages > 1) {
        const extraPages = [];
        for (let p = 2; p <= res.meta.totalPages; p++) {
          extraPages.push(api.adminProducts(`?page=${p}&pageSize=50`));
        }
        const extraResults = await Promise.all(extraPages);
        extraResults.forEach((r) => {
          if (r?.items) {
            allItems = allItems.concat(r.items);
          }
        });
      }

      setProducts(allItems);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // Compute Categories from products
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      if (p.category?.id) {
        map.set(p.category.id, p.category.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  // Warehouse KPI Aggregations
  const totalUnitsInWarehouse = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
  }, [products]);

  const outOfStockList = useMemo(() => {
    return products.filter((p) => (p.stockQuantity || 0) === 0);
  }, [products]);

  const lowStockList = useMemo(() => {
    return products.filter((p) => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) < 10);
  }, [products]);

  const healthyStockList = useMemo(() => {
    return products.filter((p) => (p.stockQuantity || 0) >= 10);
  }, [products]);

  // Filtered List for Table
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Tab filter
      if (activeTab === 'OUT' && (p.stockQuantity || 0) !== 0) return false;
      if (activeTab === 'LOW' && ((p.stockQuantity || 0) === 0 || (p.stockQuantity || 0) >= 10)) return false;
      if (activeTab === 'HEALTHY' && (p.stockQuantity || 0) < 10) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && p.category?.id !== selectedCategory) return false;

      // Search query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesArabic = p.arabicName?.toLowerCase().includes(q);
        const matchesCategory = p.category?.name?.toLowerCase().includes(q);
        const matchesSku = p.sku?.toLowerCase().includes(q);
        if (!matchesName && !matchesArabic && !matchesCategory && !matchesSku) return false;
      }

      return true;
    });
  }, [products, activeTab, selectedCategory, search]);

  // Open Restock Modal with Initial Values
  const handleOpenRestockModal = (product: Product) => {
    setRestockProduct(product);
    setQuantityToAdd(0);
    setRestockNote('');
  };

  // Submit Restock from Modal
  const handleConfirmRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;

    const qty = Number(quantityToAdd);
    if (!qty || qty <= 0) {
      toast.error(t('Please enter a valid stock quantity (> 0)', 'يرجى إدخال كمية توريد صحيحة أكبر من 0'));
      return;
    }

    setSubmittingRestock(true);
    try {
      const res = await api.adminAdjustProductStock(restockProduct.id, {
        quantityToAdd: qty,
        note: restockNote.trim() || undefined,
      });

      // Update in-memory product list
      setProducts((prev) =>
        prev.map((p) => (p.id === restockProduct.id ? { ...p, stockQuantity: res.newStock } : p))
      );

      toast.success(
        t(
          `Successfully added +${qty} units to ${restockProduct.name}. Total stock is now ${res.newStock}!`,
          `تمت إضافة +${qty} قطعة إلى مخزون ${restockProduct.name}. إجمالي المخزون الآن أصبح ${res.newStock} قطعة!`
        )
      );

      setRestockProduct(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to adjust stock');
    } finally {
      setSubmittingRestock(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="serif-font text-2xl sm:text-3xl font-extrabold text-slate-900">
                {t('Warehouse & Stock Restock Hub', 'إدارة المخزون والتوريد')}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {t(
                  'Monitor inventory levels, receive supplier shipments, and increment product stock quantities.',
                  'متابعة كميات المستودع الحية، توريد الشحنات الجديدة من الموردين، وزيادة مخزون المنتجات.'
                )}
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={loadInventory}
          disabled={loading}
          className="text-xs px-4 py-2 rounded-xl border-slate-200 hover:bg-slate-50 flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          <span>{t('Refresh Inventory', 'تحديث المخزون')}</span>
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total In-Stock */}
        <div
          onClick={() => setActiveTab('ALL')}
          className={`glass-card rounded-2xl p-4 border transition-all cursor-pointer space-y-1.5 min-w-0 ${
            activeTab === 'ALL'
              ? 'border-amber-500/80 bg-amber-50/30 ring-2 ring-amber-500/20'
              : 'border-slate-200/60 bg-white hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              {t('Total Units in Stock', 'إجمالي القطع المخزنة')}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            {loading ? '...' : totalUnitsInWarehouse}
          </p>
          <p className="text-[10px] text-slate-400 font-medium truncate">
            {products.length} {t('Active SKUs / Products', 'منتج نشط')}
          </p>
        </div>

        {/* Out of Stock (0) */}
        <div
          onClick={() => setActiveTab('OUT')}
          className={`glass-card rounded-2xl p-4 border transition-all cursor-pointer space-y-1.5 min-w-0 ${
            activeTab === 'OUT'
              ? 'border-rose-500/80 bg-rose-50/30 ring-2 ring-rose-500/20'
              : 'border-slate-200/60 bg-white hover:border-rose-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider truncate">
              {t('Out of Stock (0 Units)', 'المخزون النافذ (0)')}
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 shrink-0">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-700 truncate">
            {loading ? '...' : outOfStockList.length}
          </p>
          <p className="text-[10px] text-rose-500 font-medium truncate">
            {t('Urgent restock needed', 'بحاجة لتوريد فوري')}
          </p>
        </div>

        {/* Low Stock (< 10) */}
        <div
          onClick={() => setActiveTab('LOW')}
          className={`glass-card rounded-2xl p-4 border transition-all cursor-pointer space-y-1.5 min-w-0 ${
            activeTab === 'LOW'
              ? 'border-amber-500/80 bg-amber-50/30 ring-2 ring-amber-500/20'
              : 'border-slate-200/60 bg-white hover:border-amber-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider truncate">
              {t('Low Stock Alert (< 10)', 'منخفض المخزون (< 10)')}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-700 truncate">
            {loading ? '...' : lowStockList.length}
          </p>
          <p className="text-[10px] text-amber-600 font-medium truncate">
            {t('Running low on stock', 'على وشك النفاذ')}
          </p>
        </div>

        {/* Healthy Stock (>= 10) */}
        <div
          onClick={() => setActiveTab('HEALTHY')}
          className={`glass-card rounded-2xl p-4 border transition-all cursor-pointer space-y-1.5 min-w-0 ${
            activeTab === 'HEALTHY'
              ? 'border-emerald-500/80 bg-emerald-50/30 ring-2 ring-emerald-500/20'
              : 'border-slate-200/60 bg-white hover:border-emerald-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider truncate">
              {t('Healthy Stock (>= 10)', 'مخزون مستقر (10+)')}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 truncate">
            {loading ? '...' : healthyStockList.length}
          </p>
          <p className="text-[10px] text-emerald-600 font-medium truncate">
            {t('Adequate quantity available', 'الكمية متوفرة بشكل كافٍ')}
          </p>
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="glass-card rounded-3xl border border-slate-200/70 bg-white shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
        {/* Controls: Search, Tabs & Categories */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('All Products', 'كافة المنتجات')} ({products.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('OUT')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'OUT'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-500 hover:text-rose-600'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>{t('Out of Stock', 'النافذ')} ({outOfStockList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('LOW')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'LOW'
                  ? 'bg-white text-amber-800 shadow-2xs'
                  : 'text-slate-500 hover:text-amber-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('Low Stock', 'منخفض')} ({lowStockList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('HEALTHY')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'HEALTHY'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-500 hover:text-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('Healthy', 'مستقر')} ({healthyStockList.length})</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
            >
              <option value="ALL">{t('All Categories', 'كافة الفئات')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('Search product, SKU...', 'بحث باسم المنتج أو الرمز...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 w-56 sm:w-64 bg-slate-50/70"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <Package className="w-9 h-9 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">
              {t('No products match the selected filter', 'لا توجد منتجات مطابقة لهذا الفلتر')}
            </p>
            <p className="text-xs text-slate-400">
              {t('Try adjusting your search query or tab selection', 'جرب تعديل كلمة البحث أو تغيير الفئة')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-600">
                  <th className="py-3 px-4 font-bold">{t('Product Details', 'تفاصيل المنتج')}</th>
                  <th className="py-3 px-3 font-bold">{t('Category & SKU', 'الفئة والرمز')}</th>
                  <th className="py-3 px-3 font-bold text-center">{t('Current Stock', 'المخزون الحالي')}</th>
                  <th className="py-3 px-3 font-bold text-center">{t('Status', 'الحالة')}</th>
                  <th className="py-3 px-4 font-bold text-right rtl:text-left">
                    {t('Stock Actions (Restock from Provider)', 'إجراءات التوريد (إضافة مخزون)')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const stock = product.stockQuantity || 0;
                  const isOut = stock === 0;
                  const isLow = stock > 0 && stock < 10;

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isOut ? 'bg-rose-50/20' : isLow ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Product Name & Image */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200/80 shrink-0 bg-slate-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                              <Box className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{product.name}</p>
                            {product.arabicName && (
                              <p className="text-[11px] text-slate-500 truncate">{product.arabicName}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & SKU */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-700 block">
                          {product.category?.name ?? '-'}
                        </span>
                        {product.sku && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            SKU: {product.sku}
                          </span>
                        )}
                      </td>

                      {/* Current Stock Quantity */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono text-base font-black px-3 py-1 rounded-xl bg-slate-100 text-slate-900 border border-slate-200">
                          {stock}
                          <span className="text-[10px] font-sans font-normal text-slate-500">
                            {t('units', 'قطعة')}
                          </span>
                        </div>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3.5 px-3 text-center">
                        {isOut ? (
                          <Badge variant="danger" className="font-bold text-[10px] px-2.5 py-0.5">
                            {t('Out of Stock', 'نافذ')}
                          </Badge>
                        ) : isLow ? (
                          <Badge variant="warning" className="font-bold text-[10px] px-2.5 py-0.5">
                            {t('Low Stock', 'منخفض')}
                          </Badge>
                        ) : (
                          <Badge variant="success" className="font-bold text-[10px] px-2.5 py-0.5">
                            {t('In Stock', 'متوفر')}
                          </Badge>
                        )}
                      </td>

                      {/* Restock Actions */}
                      <td className="py-3.5 px-4 text-right rtl:text-left">
                        <div className="flex items-center justify-end rtl:justify-start">
                          {/* Primary "Add Stock from Provider" Modal Trigger Button */}
                          <Button
                            type="button"
                            onClick={() => handleOpenRestockModal(product)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t('Add Stock', 'توريد مخزون')}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restock Supplier Modal Dialog */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {t('Receive Supplier Stock', 'توريد شحنة جديدة للمخزون')}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {restockProduct.name} ({restockProduct.category?.name})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRestockProduct(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleConfirmRestock} className="p-5 sm:p-6 space-y-5">
              {/* Product Info Card with Live Calculation */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {t('Current Warehouse Stock:', 'المخزون الحالي في المستودع:')}
                  </span>
                  <span className="font-bold text-slate-800 font-mono text-sm px-2.5 py-0.5 rounded-lg bg-white border border-slate-200">
                    {restockProduct.stockQuantity || 0} {t('units', 'قطعة')}
                  </span>
                </div>

                {/* Calculation Formula Banner */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="text-emerald-700 font-semibold block text-[11px]">
                      {t('Stock Calculation Formula:', 'حساب المخزون التراكمي:')}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-900">
                      {restockProduct.stockQuantity || 0} (حالي) + {Number(quantityToAdd) || 0} (مورد)
                    </span>
                  </div>

                  <div className="text-right rtl:text-left shrink-0">
                    <span className="text-[10px] text-emerald-700 font-extrabold uppercase block">
                      {t('New Total Stock', 'إجمالي المخزون الجديد')}
                    </span>
                    <span className="font-mono text-lg font-black text-emerald-800">
                      = {(restockProduct.stockQuantity || 0) + (Number(quantityToAdd) || 0)}{' '}
                      <span className="text-xs font-sans">{t('units', 'قطعة')}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity to Add Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  {t('New Shipment Quantity from Provider:', 'الكمية المستلمة من المورد:')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={100000}
                    value={quantityToAdd === 0 ? '' : quantityToAdd}
                    onChange={(e) => setQuantityToAdd(parseInt(e.target.value, 10) || 0)}
                    className="w-full font-mono text-lg font-bold px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
                    placeholder="0"
                    required
                  />
                  <span className="absolute right-4 rtl:left-4 rtl:right-auto top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {t('units', 'قطعة')}
                  </span>
                </div>

              </div>

              {/* Optional Supplier / Batch Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  {t('Supplier Note / Batch Reference (Optional):', 'ملاحظة التوريد / رقم الشحنة (اختياري):')}
                </label>
                <input
                  type="text"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  placeholder={t('e.g., Shipment #402 / Fresh batch received', 'مثال: شحنة رقم 402 / توريد جديد من المورد')}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setRestockProduct(null)}
                  disabled={submittingRestock}
                  className="text-xs px-4 py-2.5 rounded-xl border-slate-200"
                >
                  {t('Cancel', 'إلغاء')}
                </Button>

                <Button
                  type="submit"
                  disabled={submittingRestock}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                >
                  {submittingRestock ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('Updating Stock...', 'جاري تحديث المخزون...')}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {t(
                          `Confirm & Add +${quantityToAdd} Units`,
                          `تأكيد وإضافة +${quantityToAdd} للمخزون`
                        )}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
