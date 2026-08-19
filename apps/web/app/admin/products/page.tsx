'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  LayoutGrid,
  List,
  ExternalLink,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpDown,
  Tag,
  ShieldCheck,
  DollarSign,
  Box,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Product, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { formatMoney } from '@/lib/format';
import { useLanguage } from '@/lib/language-context';
import { toast, Toaster } from 'sonner';

type ViewMode = 'GRID' | 'TABLE';
type FilterStatusTab = 'ALL' | 'ACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DRAFT';
type SortOption = 'NEWEST' | 'PRICE_DESC' | 'PRICE_ASC' | 'STOCK_ASC' | 'NAME_ASC';

export default function AdminProductsPage() {
  const { t, formatProductName, formatCategoryName, lang } = useLanguage();
  const isRtl = lang === 'ar';
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // UI Display & Filtering State
  const [viewMode, setViewMode] = useState<ViewMode>('GRID');
  const [search, setSearch] = useState<string>('');
  const [statusTab, setStatusTab] = useState<FilterStatusTab>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');
  const [categories, setCategories] = useState<Category[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch product list
  const loadProducts = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', '24');

      if (selectedCategory !== 'ALL') {
        params.set('categoryId', selectedCategory);
      }

      if (statusTab === 'ACTIVE') {
        params.set('isActive', 'true');
      } else if (statusTab === 'OUT_OF_STOCK') {
        params.set('maxStock', '0');
      } else if (statusTab === 'LOW_STOCK') {
        params.set('maxStock', '9');
        params.set('minStock', '1');
      }

      const res = await api.adminProducts(`?${params.toString()}`);
      setProducts(res.items || []);
      setTotalPages(res.meta.totalPages || 1);
      setTotalCount(res.meta.total || 0);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories once for filter
  const loadCategories = async () => {
    try {
      const res = await api.categories();
      setCategories(res || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, selectedCategory, statusTab]);

  // Handle URL query messages
  useEffect(() => {
    if (searchParams.get('created') === '1') {
      toast.success(t('Product created successfully!', 'تم إنشاء المنتج بنجاح!'));
    } else if (searchParams.get('updated') === '1') {
      toast.success(t('Product updated successfully!', 'تم حفظ وتحديث بيانات المنتج بنجاح!'));
    }
  }, [searchParams, t]);

  // Delete product handler
  const removeProduct = async (id: string, name: string) => {
    const confirmed = window.confirm(
      t(
        `Are you sure you want to permanently delete "${name}"?`,
        `هل أنت متأكد من رغبتك في حذف المنتج "${name}" بشكل نهائي؟`
      )
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await api.adminDeleteProduct(id);
      toast.success(t('Product deleted successfully', 'تم حذف المنتج بنجاح'));
      loadProducts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter & Sort In-Memory for Search and Instant Sorting
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Local Search Filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.arabicName?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'PRICE_DESC') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'PRICE_ASC') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'STOCK_ASC') {
      result.sort((a, b) => a.stockQuantity - b.stockQuantity);
    } else if (sortBy === 'NAME_ASC') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, search, sortBy]);

  // Quick Catalog KPI Calculations
  const stats = useMemo(() => {
    const total = totalCount;
    const active = products.filter((p) => p.isActive).length;
    const lowStock = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity < 10).length;
    const outOfStock = products.filter((p) => p.stockQuantity === 0).length;
    const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.stockQuantity, 0);

    return { total, active, lowStock, outOfStock, totalInventoryValue };
  }, [products, totalCount]);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <Toaster position="top-right" richColors />

      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="serif-font text-2xl sm:text-3xl font-extrabold text-slate-900">
                {t('Product Catalog & Inventory', 'كتالوج المنتجات والمخزون')}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {t(
                  'Manage store items, pricing, inventory stock, and regulatory compliance.',
                  'إدارة المنتجات المعروضة، الأسعار، الكميات المخزنة، وضوابط الامتثال النظامي.'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            type="button"
            variant="secondary"
            onClick={loadProducts}
            disabled={loading}
            className="text-xs px-3.5 py-2.5 rounded-xl border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('Refresh', 'تحديث')}</span>
          </Button>

          <Link href="/admin/products/new">
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>{t('Create New Product', 'إضافة منتج جديد')}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200/60 bg-white shadow-xs space-y-1.5 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
              {t('Total Products', 'إجمالي المنتجات')}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 truncate">
            {stats.total}
          </p>
          <p className="text-[10px] text-slate-400 font-medium truncate">
            {categories.length} {t('Active Categories', 'فئة مصنفة')}
          </p>
        </div>

        {/* Active / Published */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200/60 bg-white shadow-xs space-y-1.5 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider truncate">
              {t('Active for Sale', 'معروضة بالمتجر')}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 truncate">
            {stats.active}
          </p>
          <p className="text-[10px] text-emerald-600 font-medium truncate">
            {t('Live on storefront', 'جاهزة للشراء')}
          </p>
        </div>

        {/* Low / Out of Stock */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200/60 bg-white shadow-xs space-y-1.5 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider truncate">
              {t('Low / Out of Stock', 'تنبيهات المخزون')}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-700 truncate">
            {stats.lowStock + stats.outOfStock}
          </p>
          <p className="text-[10px] text-amber-600 font-medium truncate">
            {stats.outOfStock} {t('out of stock', 'نافذ تماماً')} · {stats.lowStock} {t('low', 'منخفض')}
          </p>
        </div>

        {/* Catalog Value */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200/60 bg-white shadow-xs space-y-1.5 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider truncate">
              {t('Catalog Retail Value', 'القيمة البيعية الإجمالية')}
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 font-mono truncate">
            {formatMoney(stats.totalInventoryValue)}
          </p>
          <p className="text-[10px] text-purple-600 font-medium truncate">
            {t('Estimated retail stock', 'قيمة المخزون الحالي')}
          </p>
        </div>
      </div>

      {/* Controls: Search, Status Tabs, Category Filter & View Mode Switcher */}
      <div className="glass-card rounded-3xl p-5 border border-slate-200/70 bg-white shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setStatusTab('ALL');
                setPage(1);
              }}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('All', 'الكل')}
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusTab('ACTIVE');
                setPage(1);
              }}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusTab === 'ACTIVE'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-500 hover:text-emerald-700'
              }`}
            >
              {t('Active', 'النشطة')}
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusTab('LOW_STOCK');
                setPage(1);
              }}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusTab === 'LOW_STOCK'
                  ? 'bg-white text-amber-800 shadow-2xs'
                  : 'text-slate-500 hover:text-amber-700'
              }`}
            >
              {t('Low Stock (<10)', 'منخفض (<10)')}
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusTab('OUT_OF_STOCK');
                setPage(1);
              }}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusTab === 'OUT_OF_STOCK'
                  ? 'bg-white text-rose-800 shadow-2xs'
                  : 'text-slate-500 hover:text-rose-700'
              }`}
            >
              {t('Out of Stock (0)', 'النافذ (0)')}
            </button>
          </div>

          {/* View Mode & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none font-medium focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="ALL">{t('All Categories', 'كافة الفئات')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {isRtl && c.arabicName ? c.arabicName : c.name}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none font-medium focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="NEWEST">{t('Sort: Newest', 'الترتيب: الأحدث')}</option>
              <option value="PRICE_DESC">{t('Price: High to Low', 'السعر: من الأعلى للأقل')}</option>
              <option value="PRICE_ASC">{t('Price: Low to High', 'السعر: من الأقل للأعلى')}</option>
              <option value="STOCK_ASC">{t('Stock: Low to High', 'المخزون: الأقل أولاً')}</option>
              <option value="NAME_ASC">{t('Name: Alphabetical', 'الاسم أبجدياً')}</option>
            </select>

            {/* View Switcher Buttons (Grid vs Table) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'GRID'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title={t('Grid Cards View', 'عرض البطاقات المرئية')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'TABLE'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title={t('Table List View', 'عرض الجدول المنظم')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t(
              'Instant search by product title, Arabic name, SKU, brand, or category...',
              'بحث فوري بالاسم العربي أو الإنجليزي، رمز SKU، الماركة، أو الفئة...'
            )}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-slate-50/70"
          />
        </div>
      </div>

      {/* Products Content: Grid View or Table View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500"></div>
          <p className="text-xs font-semibold text-slate-500 animate-pulse">
            {t('Loading catalog products...', 'جاري تحميل منتجات الكتالوج...')}
          </p>
        </div>
      ) : processedProducts.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center text-slate-400 space-y-3 border border-slate-200/80 bg-white">
          <Package className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">
            {t('No products found', 'لم يتم العثور على منتجات')}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {t(
              'No products matched the current search filter or status selection. Try clearing filters or create a new product.',
              'لا توجد منتجات مطابقة لهذا الفلتر أو البحث. يمكنك إنشاء منتج جديد أو مسح الفلاتر.'
            )}
          </p>
          <div className="pt-2">
            <Link href="/admin/products/new">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl">
                <Plus className="w-4 h-4 mr-1.5" />
                {t('Add Product', 'إضافة منتج')}
              </Button>
            </Link>
          </div>
        </div>
      ) : viewMode === 'GRID' ? (
        /* ================== GRID CARDS VIEW ================== */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {processedProducts.map((product) => {
            const isOut = product.stockQuantity === 0;
            const isLow = product.stockQuantity > 0 && product.stockQuantity < 10;
            const isDeleting = deletingId === product.id;

            return (
              <div
                key={product.id}
                className="group glass-card rounded-3xl border border-slate-200/80 bg-white shadow-xs hover:shadow-xl hover:border-amber-400/60 transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
              >
                {/* Top Image Container with Badges */}
                <div className="relative aspect-square w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <Box className="w-12 h-12" />
                      <span className="text-[10px] mt-1 font-bold">No Image</span>
                    </div>
                  )}

                  {/* Stock Floating Badge */}
                  <div className="absolute top-3 left-3 rtl:right-3 rtl:left-auto flex flex-col gap-1 z-10">
                    {isOut ? (
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-rose-600 text-white shadow-md flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {t('Out of Stock', 'نافذ (0)')}
                      </span>
                    ) : isLow ? (
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 shadow-md flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {t('Low Stock', 'متبقي')} ({product.stockQuantity})
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-600/90 text-white backdrop-blur-xs shadow-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {product.stockQuantity} {t('in stock', 'قطعة')}
                      </span>
                    )}
                  </div>

                  {/* Status Indicator Badge */}
                  <div className="absolute top-3 right-3 rtl:left-3 rtl:right-auto z-10">
                    {product.isActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-emerald-400 backdrop-blur-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {t('Live', 'معروض')}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-300 backdrop-blur-xs flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        {t('Hidden', 'مخفي')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Details Body */}
                <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category & SKU */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md truncate max-w-[60%]">
                        {formatCategoryName(product.category)}
                      </span>
                      {product.sku && <span className="font-mono text-[10px]">SKU: {product.sku}</span>}
                    </div>

                    {/* Product Titles */}
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    {product.arabicName && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                        {product.arabicName}
                      </p>
                    )}
                  </div>

                  {/* Pricing & Cost Margin Info */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                        {t('Selling Price', 'سعر البيع')}
                      </span>
                      <span className="font-mono text-base font-black text-slate-900">
                        {formatMoney(product.price)}
                      </span>
                    </div>

                    {product.costPrice !== undefined && Number(product.costPrice) > 0 && (
                      <div className="text-right rtl:text-left text-[11px]">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                          {t('Cost', 'التكلفة')}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {formatMoney(product.costPrice)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer Bar */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Edit Button */}
                    <Link href={`/admin/products/${product.id}`} className="flex-1">
                      <Button
                        variant="secondary"
                        className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200 hover:bg-white flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                        <span>{t('Edit', 'تعديل')}</span>
                      </Button>
                    </Link>

                    {/* Storefront Preview Link */}
                    {product.slug && (
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="p-2 rounded-xl bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200 transition"
                        title={t('Preview on Storefront', 'معاينة في المتجر')}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => removeProduct(product.id, product.name)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                    title={t('Delete Product', 'حذف المنتج')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================== TABLE LIST VIEW ================== */
        <div className="glass-card rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-600">
                  <th className="py-3.5 px-4 font-bold">{t('Product', 'المنتج')}</th>
                  <th className="py-3.5 px-3 font-bold">{t('Category & SKU', 'الفئة والرمز')}</th>
                  <th className="py-3.5 px-3 font-bold">{t('Price & Cost', 'السعر والتكلفة')}</th>
                  <th className="py-3.5 px-3 font-bold text-center">{t('Stock Level', 'المخزون')}</th>
                  <th className="py-3.5 px-3 font-bold text-center">{t('Status', 'الحالة')}</th>
                  <th className="py-3.5 px-4 font-bold text-right rtl:text-left">{t('Actions', 'الإجراءات')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedProducts.map((product) => {
                  const isOut = product.stockQuantity === 0;
                  const isLow = product.stockQuantity > 0 && product.stockQuantity < 10;
                  const isDeleting = deletingId === product.id;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Product Thumbnail & Titles */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
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
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 block">
                          {formatCategoryName(product.category)}
                        </span>
                        {product.sku && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            SKU: {product.sku}
                          </span>
                        )}
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-3">
                        <span className="font-mono font-black text-slate-900 block">
                          {formatMoney(product.price)}
                        </span>
                        {product.costPrice !== undefined && Number(product.costPrice) > 0 && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {t('Cost:', 'التكلفة:')} {formatMoney(product.costPrice)}
                          </span>
                        )}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3 px-3 text-center">
                        {isOut ? (
                          <Badge variant="danger" className="font-bold text-[10px] px-2 py-0.5">
                            {t('Out (0)', 'نافذ (0)')}
                          </Badge>
                        ) : isLow ? (
                          <Badge variant="warning" className="font-bold text-[10px] px-2 py-0.5">
                            {product.stockQuantity} {t('units', 'قطع')}
                          </Badge>
                        ) : (
                          <Badge variant="success" className="font-bold text-[10px] px-2 py-0.5">
                            {product.stockQuantity} {t('units', 'قطعة')}
                          </Badge>
                        )}
                      </td>

                      {/* Visibility / Status */}
                      <td className="py-3 px-3 text-center">
                        {product.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Eye className="w-3 h-3" />
                            {t('Active', 'نشط')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <EyeOff className="w-3 h-3" />
                            {t('Hidden', 'مخفي')}
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right rtl:text-left">
                        <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                          <Link href={`/admin/products/${product.id}`}>
                            <Button variant="secondary" className="text-xs py-1.5 px-3 rounded-xl border-slate-200">
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{t('Edit', 'تعديل')}</span>
                            </Button>
                          </Link>

                          {product.slug && (
                            <Link
                              href={`/products/${product.slug}`}
                              target="_blank"
                              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
                              title={t('Preview on Storefront', 'معاينة في المتجر')}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => removeProduct(product.id, product.name)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                            title={t('Delete', 'حذف')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center pt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
