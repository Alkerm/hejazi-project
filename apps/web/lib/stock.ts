import { Product } from '@/lib/types';

type StockBadgeVariant = 'success' | 'warning' | 'danger';

export function getStockStatus(
  stockQuantity: Product['stockQuantity'],
  lang: 'en' | 'ar' = 'ar'
): {
  label: string;
  variant: StockBadgeVariant;
} {
  if (stockQuantity <= 0) {
    return {
      label: lang === 'ar' ? 'نفذت الكمية' : 'Out of stock',
      variant: 'danger',
    };
  }

  if (stockQuantity < 10) {
    return {
      label: lang === 'ar' ? 'كمية محدودة' : 'Low stock',
      variant: 'warning',
    };
  }

  return {
    label: lang === 'ar' ? 'متوفر بالمخزون' : 'In stock',
    variant: 'success',
  };
}
