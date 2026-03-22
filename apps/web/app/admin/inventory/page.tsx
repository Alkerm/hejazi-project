'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export default function AdminInventoryPage() {
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

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Inventory Monitoring</h2>
        <p className="text-sm text-slate-600">
          Products are split into low stock (&lt;10) and healthy stock (&gt;=10), with exact quantities shown.
        </p>
      </div>

      {loading && <p className="text-sm text-slate-600">Loading inventory...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="overflow-hidden rounded-xl border border-red-200 bg-white">
        <div className="bg-red-600 px-4 py-3 text-sm font-bold text-white">Low Stock Products</div>
        <div className="space-y-2 p-4">
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-slate-600">No low-stock products.</p>
          ) : (
            <>
              <div className="grid grid-cols-[minmax(0,2fr)_220px_180px] items-center border-b pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Product</span>
                <span className="text-center">Category</span>
                <span className="text-center">Stock</span>
              </div>
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[minmax(0,2fr)_220px_180px] items-center border-b pb-2 text-sm"
                >
                  <span>{item.name}</span>
                  <span className="text-center">{item.category.name}</span>
                  <span className="flex justify-center">
                    <Badge variant="danger">Stock: {item.stockQuantity}</Badge>
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-green-200 bg-white">
        <div className="bg-green-600 px-4 py-3 text-sm font-bold text-white">Healthy Stock Products</div>
        <div className="space-y-2 p-4">
          {healthyStockItems.length === 0 ? (
            <p className="text-sm text-slate-600">No healthy-stock products.</p>
          ) : (
            <>
              <div className="grid grid-cols-[minmax(0,2fr)_220px_180px] items-center border-b pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Product</span>
                <span className="text-center">Category</span>
                <span className="text-center">Stock</span>
              </div>
              {healthyStockItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[minmax(0,2fr)_220px_180px] items-center border-b pb-2 text-sm"
                >
                  <span>{item.name}</span>
                  <span className="text-center">{item.category.name}</span>
                  <span className="flex justify-center">
                    <Badge variant="success">Stock: {item.stockQuantity}</Badge>
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
