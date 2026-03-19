import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { formatMoney } from '@/lib/format';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card>
      <div className="space-y-3">
        <div className="relative h-48 overflow-hidden rounded-lg bg-slate-100">
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">{product.category.name}</p>
          {product.stockQuantity > 0 ? (
            <Badge variant={product.stockQuantity < 10 ? 'warning' : 'success'}>
              {product.stockQuantity} in stock
            </Badge>
          ) : (
            <Badge variant="danger">Out of stock</Badge>
          )}
        </div>

        <h3 className="line-clamp-1 text-base font-semibold text-slate-900">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>

        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-brand-700">{formatMoney(product.price)}</p>
          <Link href={`/products/${product.slug}`} className="text-sm font-semibold text-brand-700">
            View details
          </Link>
        </div>
      </div>
    </Card>
  );
}
