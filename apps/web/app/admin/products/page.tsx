'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/lib/format';
import { Pagination } from '@/components/ui/pagination';

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  const load = async (nextPage = page) => {
    const productRes = await api.adminProducts(`?page=${nextPage}&pageSize=10`);
    setProducts(productRes.items);
    setTotalPages(productRes.meta.totalPages || 1);
  };

  useEffect(() => {
    load().catch((e: Error) => setMessage(e.message));
  }, [page]);

  useEffect(() => {
    if (searchParams.get('created') === '1') {
      setMessage('Product created');
    }
  }, [searchParams]);

  const removeProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api.adminDeleteProduct(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Products</h2>
        <Link href="/admin/products/new">
          <Button>Create Product</Button>
        </Link>
      </div>

      <div className="rounded border bg-white p-4">
        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} className="flex flex-wrap items-start justify-between gap-3 border-b pb-2 text-sm">
              <div className="min-w-0">
                <p className="font-semibold">{product.name}</p>
                <p className="text-slate-600">
                  {product.category.name} | {formatMoney(product.price)} | stock {product.stockQuantity}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="danger" onClick={() => removeProduct(product.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
      {message && <p className="text-sm text-slate-700">{message}</p>}
    </div>
  );
}
