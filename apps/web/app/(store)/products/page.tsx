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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Products</h1>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search products"
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />

        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
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

        <select
          className="rounded border border-slate-300 px-3 py-2 text-sm"
          value={sort}
          onChange={(e) => {
            setPage(1);
            setSort(e.target.value as typeof sort);
          }}
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price low to high</option>
          <option value="price_desc">Price high to low</option>
          <option value="name_asc">Name A-Z</option>
        </select>

        <button
          className="rounded bg-slate-100 px-3 py-2 text-sm font-semibold"
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

      {loading && <p className="text-sm text-slate-600">Loading products...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="rounded border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          No products match your filters.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
