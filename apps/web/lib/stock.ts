import { Product } from '@/lib/types';

type StockBadgeVariant = 'success' | 'warning' | 'danger';

export function getStockStatus(stockQuantity: Product['stockQuantity']): {
  label: string;
  variant: StockBadgeVariant;
} {
  if (stockQuantity <= 0) {
    return { label: 'Out of stock', variant: 'danger' };
  }

  if (stockQuantity < 10) {
    return { label: 'Low stock', variant: 'warning' };
  }

  return { label: 'In stock', variant: 'success' };
}
