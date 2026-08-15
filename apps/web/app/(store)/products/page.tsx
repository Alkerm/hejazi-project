'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { Category, Product } from '@/lib/types';
import { ProductCard } from '@/components/store/product-card';
import { Pagination } from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/use-debounce';
import { CategoryCarousel } from '@/components/store/category-carousel';
import { useLanguage } from '@/lib/language-context';

import { HeroBanner } from '@/components/store/hero-banner';

export default function ProductsPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc' | 'name_asc'>('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', '8');
    params.set('sort', sort);
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
    if (category) params.set('category', category);
    return `?${params.toString()}`;
  }, [page, sort, debouncedSearch, category]);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => null);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .products(query)
      .then((result) => {
        setItems(result.items);
        setTotalPages(result.meta.totalPages || 1);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [query]);

  const handleCategorySelect = (selectedSlug: string) => {
    setPage(1);
    if (category === selectedSlug) {
      setCategory('');
    } else {
      setCategory(selectedSlug);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in" id="products-grid">
      {/* Dynamic High-Impact Landing Hero Banner */}
      <HeroBanner />

      {/* Visual Category Cards Carousel */}
      <CategoryCarousel
        categories={categories}
        selectedCategory={category}
        onSelectCategory={handleCategorySelect}
      />

      {/* Sleek Search & Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card rounded-2xl p-4 border border-slate-200/50">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder={t('Search products', 'البحث في المنتجات')}
            className="w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-xs font-medium placeholder-slate-400 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-amber-500 shadow-2xs"
            value={sort}
            onChange={(e) => {
              setPage(1);
              setSort(e.target.value as typeof sort);
            }}
          >
            <option value="newest">{t('Newest Arrivals', 'أحدث المنتجات')}</option>
            <option value="price_asc">{t('Price: Low to High', 'السعر: من الأقل للأعلى')}</option>
            <option value="price_desc">{t('Price: High to Low', 'السعر: من الأعلى للأقل')}</option>
            <option value="name_asc">{t('Alphabetical: A-Z', 'أبجدي: أ-ي')}</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-600"></div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">
            {t('Loading collection...', 'جاري تحميل المنتجات...')}
          </p>
        </div>
      )}
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white/50 backdrop-blur-sm p-10 text-center text-sm text-slate-500">
          {t(
            'No matches found for your criteria. Try adjusting your search term or category.',
            'لم يتم العثور على نتائج تطابق بحثك. جرب تغيير كلمة البحث أو القسم.'
          )}
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="pt-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
