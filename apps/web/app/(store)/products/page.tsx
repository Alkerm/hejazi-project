'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Category, Product } from '@/lib/types';
import { ProductCard } from '@/components/store/product-card';
import { Pagination } from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/use-debounce';

export default function ProductsPage() {
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

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2 py-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-800">
          The Beauty Collection
        </h1>
        <p className="text-xs uppercase tracking-[0.25em] font-medium text-luxury-gold">
          Curated Skincare, Makeup & Fragrances
        </p>
      </div>

      {/* Glassmorphic Search & Filters Bar */}
      <div className="glass-card rounded-2xl p-5 grid gap-4 md:grid-cols-4 items-center">
        <div className="relative">
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search our collection..."
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-xs font-medium placeholder-slate-400 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="relative">
          <select
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-brand-400"
            value={category}
            onChange={(e) => {
              setPage(1);
              setCategory(e.target.value);
            }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-brand-400"
            value={sort}
            onChange={(e) => {
              setPage(1);
              setSort(e.target.value as typeof sort);
            }}
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Alphabetical: A-Z</option>
          </select>
        </div>

        <button
          className="rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300 transition duration-300 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-600 active:scale-[0.98]"
          onClick={() => {
            setSearch('');
            setCategory('');
            setSort('newest');
            setPage(1);
          }}
        >
          Reset filters
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600"></div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">Loading collection...</p>
        </div>
      )}
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white/50 backdrop-blur-sm p-10 text-center text-sm text-slate-500">
          No matches found for your criteria. Try adjusting your search term or category.
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
