'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/language-context';

export default function AdminInventoryPage() {
  const { t } = useLanguage();
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [healthyStockItems, setHealthyStockItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      api.adminInventoryLowStock('?threshold=9&page=1&pageSize=50'),
      api.adminProducts('?minStock=10&page=1&pageSize=50&isActive=true'),
    ])
      .then(([lowStockRes, healthyStockRes]) => {
        setLowStockItems(lowStockRes.items);
        setHealthyStockItems(healthyStockRes.items);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">
          {t('Loading inventory status...', 'جاري تحميل حالة المخزون...')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1 border-b border-slate-200/50 pb-4">
        <h2 className="serif-font text-3xl font-bold text-slate-800">{t('Inventory Monitoring', 'مراقبة المخزون والكميات')}</h2>
        <p className="text-xs text-slate-500 uppercase tracking-widest">
          {t('Products split into low stock (<10) and healthy stock (>=10)', 'تقسيم المنتجات إلى منخفضة المخزون (<10) ومستقرة (>=10)')}
        </p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">{error}</p>}

      <section className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-xs">
        <div className="bg-red-600 px-4 py-3 text-xs font-bold text-white uppercase tracking-wider">
          {t('Low Stock Products', 'منتجات منخفضة المخزون (تخزين منخفض)')}
        </div>
        <div className="p-4">
          {lowStockItems.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">{t('No low-stock products.', 'لا توجد منتجات منخفضة المخزون.')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs text-slate-700">
                <thead className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-3 py-2 text-start">{t('Product Name', 'اسم المنتج')}</th>
                    <th className="px-3 py-2 text-center">{t('Category', 'الفئة')}</th>
                    <th className="px-3 py-2 text-center">{t('Stock Quantity', 'الكمية المتبقية')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-3 py-3 font-semibold text-slate-800">{item.name}</td>
                      <td className="px-3 py-3 text-center text-slate-500">{item.category.name}</td>
                      <td className="px-3 py-3 text-center">
                        <Badge variant="danger">{t('Stock:', 'المتبقي:')} {item.stockQuantity}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-xs">
        <div className="bg-emerald-600 px-4 py-3 text-xs font-bold text-white uppercase tracking-wider">
          {t('Healthy Stock Products', 'منتجات متوفرة بمخزون جيد')}
        </div>
        <div className="p-4">
          {healthyStockItems.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">{t('No healthy-stock products.', 'لا توجد منتجات بالمخزون المستقر.')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs text-slate-700">
                <thead className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-3 py-2 text-start">{t('Product Name', 'اسم المنتج')}</th>
                    <th className="px-3 py-2 text-center">{t('Category', 'الفئة')}</th>
                    <th className="px-3 py-2 text-center">{t('Stock Quantity', 'الكمية المتبقية')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {healthyStockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-3 py-3 font-semibold text-slate-800">{item.name}</td>
                      <td className="px-3 py-3 text-center text-slate-500">{item.category.name}</td>
                      <td className="px-3 py-3 text-center">
                        <Badge variant="success">{t('Stock:', 'المتبقي:')} {item.stockQuantity}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
