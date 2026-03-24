'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ProductStatus = 'DRAFT' | 'COMPLIANCE_REVIEW' | 'APPROVED' | 'INACTIVE';

const initialForm = {
  name: '',
  arabicName: '',
  slug: '',
  description: '',
  price: 0,
  stockQuantity: 0,
  sku: '',
  brand: '',
  ingredients: '',
  warnings: '',
  usageInstructions: '',
  countryOfOrigin: '',
  manufacturer: '',
  importerResponsible: '',
  sfdaReference: '',
  batchNumberRequired: false,
  expiryDateRequired: false,
  productStatus: 'DRAFT' as ProductStatus,
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
        <Input
          label="Arabic name"
          value={form.arabicName}
          onChange={(e) => setForm({ ...form, arabicName: e.target.value })}
        />
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
        <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        <Input label="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
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
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Product status
          <select
            className="rounded border border-slate-300 px-3 py-2"
            value={form.productStatus}
            onChange={(e) =>
              setForm({
                ...form,
                productStatus: e.target.value as 'DRAFT' | 'COMPLIANCE_REVIEW' | 'APPROVED' | 'INACTIVE',
              })
            }
          >
            <option value="DRAFT">Draft</option>
            <option value="COMPLIANCE_REVIEW">Compliance review</option>
            <option value="APPROVED">Approved for sale</option>
            <option value="INACTIVE">Inactive</option>
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
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.batchNumberRequired}
            onChange={(e) => setForm({ ...form, batchNumberRequired: e.target.checked })}
          />
          Batch number tracking
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.expiryDateRequired}
            onChange={(e) => setForm({ ...form, expiryDateRequired: e.target.checked })}
          />
          Expiry tracking
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
        <label className="col-span-full flex flex-col gap-1 text-sm font-medium text-slate-700">
          Ingredients
          <textarea
            className="rounded border border-slate-300 px-3 py-2"
            value={form.ingredients}
            onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
            rows={3}
          />
        </label>
        <label className="col-span-full flex flex-col gap-1 text-sm font-medium text-slate-700">
          Warnings / precautions
          <textarea
            className="rounded border border-slate-300 px-3 py-2"
            value={form.warnings}
            onChange={(e) => setForm({ ...form, warnings: e.target.value })}
            rows={3}
          />
        </label>
        <label className="col-span-full flex flex-col gap-1 text-sm font-medium text-slate-700">
          Usage instructions
          <textarea
            className="rounded border border-slate-300 px-3 py-2"
            value={form.usageInstructions}
            onChange={(e) => setForm({ ...form, usageInstructions: e.target.value })}
            rows={3}
          />
        </label>
        <Input
          label="Country of origin"
          value={form.countryOfOrigin}
          onChange={(e) => setForm({ ...form, countryOfOrigin: e.target.value })}
        />
        <Input
          label="Manufacturer"
          value={form.manufacturer}
          onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
        />
        <Input
          label="Importer / responsible party"
          value={form.importerResponsible}
          onChange={(e) => setForm({ ...form, importerResponsible: e.target.value })}
        />
        <Input
          label="SFDA reference"
          value={form.sfdaReference}
          onChange={(e) => setForm({ ...form, sfdaReference: e.target.value })}
        />
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
