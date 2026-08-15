'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { Wishlist } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/store/product-card';
import { useLanguage } from '@/lib/language-context';

export default function WishlistPage() {
  const { t } = useLanguage();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const data = await api.wishlist();
      setWishlist(data);
    } catch (err: any) {
      toast.error(t('Please log in or create an account to view your wishlist', 'يرجى تسجيل الدخول أو إنشاء حساب لمشاهدة المفضلة'));
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await api.addCartItem({ productId, quantity: 1 });
      toast.success(t(`Added "${productName}" to your cart!`, `تمت إضافة "${productName}" إلى السلة!`));
    } catch (err: any) {
      toast.error(err.message || 'Failed to add item to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Toaster position="top-right" richColors />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-rose-500"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">
          {t('Loading Wishlist...', 'جاري تحميل المفضلة...')}
        </p>
      </div>
    );
  }

  const items = wishlist?.items || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <Toaster position="top-right" richColors />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 backdrop-blur-sm p-12 text-center space-y-4">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 text-sm">{t('Your wishlist is currently empty.', 'المفضلة فارغة حالياً.')}</p>
          <p className="text-xs text-slate-400">
            {t('Click the heart icon on any product to save it here for later.', 'انقر على أيقونة القلب على أي منتج لحفظه هنا لاحقاً.')}
          </p>
          <Link href="/products" className="inline-block pt-2">
            <Button className="bg-rose-600 hover:bg-rose-700 text-white">{t('Browse Cosmetics Catalog', 'استكشف كتالوج التجميل')}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              {t('Showing', 'عرض')} {items.length} {t('saved items', 'منتجات محفوظة')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <motion.div key={item.id} layout className="flex flex-col justify-between h-full">
                <ProductCard product={item.product} initialWishlisted={true} />
                <div className="mt-2 flex gap-2">
                  <Button
                    onClick={() => handleAddToCart(item.product.id, item.product.name)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs py-2 flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> {t('Move to Cart', 'إضافة للسلة')}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
