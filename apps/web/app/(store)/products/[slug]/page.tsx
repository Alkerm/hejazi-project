'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatMoney } from '@/lib/format';
import { getStockStatus } from '@/lib/stock';

export default function ProductDetailsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [showGoToCart, setShowGoToCart] = useState(false);

  useEffect(() => {
    if (!params.slug) return;
    api
      .productDetails(params.slug)
      .then(setProduct)
      .catch((e: Error) => setMessage(e.message))
      .finally(() => setLoading(false));
  }, [params.slug]);

  const addToCart = async () => {
    if (!product) return;
    try {
      await api.addCartItem({ productId: product.id, quantity });
      setMessage('Item added to cart');
      setShowGoToCart(true);
    } catch (e) {
      setMessage((e as Error).message);
      setShowGoToCart(false);
    }
  };

  if (loading) return <p>Loading product...</p>;
  if (!product) return <p className="text-red-600">{message ?? 'Product not found'}</p>;

  const stockStatus = getStockStatus(product.stockQuantity);

  return (
    <div className="space-y-4">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative h-[420px] overflow-hidden rounded-xl bg-slate-100">
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-500">{product.category.name}</p>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-slate-600">{product.description}</p>
          <p className="text-2xl font-bold text-brand-700">{formatMoney(product.price)}</p>
          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>

          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={Math.max(1, product.stockQuantity)}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 rounded border border-slate-300 px-2 py-2"
            />
            <Button disabled={product.stockQuantity < 1} onClick={addToCart}>
              Add to cart
            </Button>
            {showGoToCart ? (
              <Button variant="secondary" onClick={() => router.push('/cart')}>
                Go to cart
              </Button>
            ) : null}
          </div>

          {message && <p className="text-sm text-slate-700">{message}</p>}

          <div className="pt-2">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
