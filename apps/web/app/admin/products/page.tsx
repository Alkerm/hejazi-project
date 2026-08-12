'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/lib/format';
import { Pagination } from '@/components/ui/pagination';
import { useLanguage } from '@/lib/language-context';

export default function AdminProductsPage() {
  const { t, formatProductName, formatCategoryName } = useLanguage();
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
      setMessage(t('Product created', 'تم إنشاء المنتج بنجاح'));
      return;
    }

    if (searchParams.get('updated') === '1') {
      setMessage(t('Product updated', 'تم تحديث المنتج بنجاح'));
    }
  }, [searchParams, t]);

  const removeProduct = async (id: string) => {
    if (!confirm(t('Delete this product?', 'هل أنت تأكد من حذف هذا المنتج؟'))) return;
    await api.adminDeleteProduct(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">{t('Products', 'إدارة المنتجات')}</h2>
        <Link href="/admin/products/new">
          <Button>{t('Create Product', 'إضافة منتج جديد')}</Button>
        </Link>
      </div>

      <div className="rounded border bg-white p-4">
        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} className="flex flex-wrap items-start justify-between gap-3 border-b pb-2 text-sm">
              <div className="min-w-0">
                <p className="font-semibold">{formatProductName(product)}</p>
                <p className="text-slate-600">
                  {formatCategoryName(product.category)} | {formatMoney(product.price)} | {t('stock', 'المخزون')} {product.stockQuantity}
                </p>
                <p className="text-slate-500">
                  {t('Status', 'الحالة')} {product.productStatus ?? 'DRAFT'} | {product.isActive ? t('Active', 'نشط') : t('Hidden', 'مخفي')}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/products/${product.id}`}>
                  <Button variant="secondary">{t('Edit', 'تعديل')}</Button>
                </Link>
                <Button variant="danger" onClick={() => removeProduct(product.id)}>
                  {t('Delete', 'حذف')}
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
