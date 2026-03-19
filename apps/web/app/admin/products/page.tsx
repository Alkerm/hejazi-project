'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatMoney } from '@/lib/format';
import { Pagination } from '@/components/ui/pagination';

const initialForm = {
  name: '',
  slug: '',
  description: '',
  price: 0,
  stockQuantity: 0,
  imageUrl: '',
  isActive: true,
  categoryId: '',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState<string | null>(null);

  const load = async (nextPage = page) => {
    const [productRes, categoryRes] = await Promise.all([
      api.adminProducts(`?page=${nextPage}&pageSize=10`),
      api.adminCategories(),
    ]);
    setProducts(productRes.items);
    setTotalPages(productRes.meta.totalPages || 1);
    setCategories(categoryRes.map((c) => ({ id: c.id, name: c.name })));
  };

  useEffect(() => {
    load().catch((e: Error) => setMessage(e.message));
  }, [page]);

  const fillEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      categoryId: product.category.id,
    });
  };

  const resetForm = () => {
    setEditing(null);
    setForm(initialForm);
  };

  const submit = async () => {
    try {
      if (editing) {
        await api.adminUpdateProduct(editing.id, form);
        setMessage('Product updated');
      } else {
        await api.adminCreateProduct(form);
        setMessage('Product created');
      }
      resetForm();
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    }
  };

  const removeProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api.adminDeleteProduct(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded border bg-white p-4 md:grid-cols-2">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <Input
          label="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
        <Input
          label="Stock Quantity"
          type="number"
          value={form.stockQuantity}
          onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
        />
        <Input
          label="Image URL"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Category
          <select
            className="rounded border border-slate-300 px-3 py-2"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>
        <label className="col-span-full flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active Product
        </label>
        <label className="col-span-full flex flex-col gap-1 text-sm font-medium text-slate-700">
          Description
          <textarea
            className="rounded border border-slate-300 px-3 py-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
        </label>
        <div className="col-span-full flex gap-2">
          <Button onClick={submit}>{editing ? 'Update Product' : 'Create Product'}</Button>
          {editing && (
            <Button variant="secondary" onClick={resetForm}>
              Cancel Edit
            </Button>
          )}
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="mb-3 text-lg font-bold">Products</h2>
        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between border-b pb-2 text-sm">
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-slate-600">
                  {product.category.name} | {formatMoney(product.price)} | stock {product.stockQuantity}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => fillEdit(product)}>
                  Edit
                </Button>
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
