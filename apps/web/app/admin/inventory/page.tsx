'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [threshold, setThreshold] = useState(5);
  const [outOfStockCount, setOutOfStockCount] = useState(0);

  useEffect(() => {
    api
      .adminInventoryLowStock(`?threshold=${threshold}&page=${page}&pageSize=12`)
      .then((res) => {
        setItems(res.items);
        setTotalPages(res.meta.totalPages || 1);
        setOutOfStockCount(res.meta.outOfStockCount);
      })
      .catch(() => null);
  }, [page, threshold]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inventory Monitoring</h2>
        <label className="text-sm">
          Threshold:{' '}
          <input
            className="w-20 rounded border px-2 py-1"
            type="number"
            min={1}
            value={threshold}
            onChange={(e) => {
              setPage(1);
              setThreshold(Number(e.target.value));
            }}
          />
        </label>
      </div>

      <p className="text-sm text-slate-600">
        Out of stock products: <span className="font-semibold">{outOfStockCount}</span>
      </p>

      <div className="rounded border bg-white p-4">
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b pb-2 text-sm">
              <span>{item.name}</span>
              <span>{item.category.name}</span>
              <Badge variant={item.stockQuantity === 0 ? 'danger' : 'warning'}>
                Stock: {item.stockQuantity}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
