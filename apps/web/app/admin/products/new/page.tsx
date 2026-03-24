'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

export default function AdminCreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .adminCategories()
      .then((res) => setCategories(res.map((c) => ({ id: c.id, name: c.name }))))
      .catch((e: Error) => setMessage(e.message));
  }, []);

  const submit = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await api.adminCreateProduct(form);
      router.push('/admin/products?created=1');
      router.refresh();
    } catch (e) {
      setMessage((e as Error).message);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Create Product</h2>
      </div>

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
          <Button onClick={submit} disabled={saving}>
            {saving ? 'Creating...' : 'Create Product'}
          </Button>
          <Button variant="secondary" onClick={() => router.push('/admin/products')}>
            Cancel
          </Button>
        </div>
      </div>

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </div>
  );
}
