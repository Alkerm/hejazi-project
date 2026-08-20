'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/lib/types';
import { getStockStatus } from '@/lib/stock';
import { Badge } from '../ui/badge';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';

export function ProductCard({ product, initialWishlisted = false }: { product: Product; initialWishlisted?: boolean }) {
  const { formatProductName, formatProductDescription, formatCategoryName, formatPrice, t, lang } = useLanguage();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isToggling, setIsToggling] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const stockStatus = getStockStatus(product.stockQuantity, lang);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const hasHint = document.cookie
        .split(';')
        .map((cookie) => cookie.trim())
        .some((cookie) => cookie.startsWith('cosmetics_sid_hint='));
      setIsSignedIn(hasHint);
    }
  }, []);

  const displayName = formatProductName(product);
  const displayDescription = formatProductDescription(product);
  const displayCategory = formatCategoryName(product.category);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isToggling) return;
    setIsToggling(true);

    try {
      const res = await api.toggleWishlist(product.id);
      setIsWishlisted(res.isWishlisted);
      if (res.isWishlisted) {
        toast.success(t(`Saved "${displayName}" to your Wishlist`, `تم حفظ "${displayName}" في المفضلة`));
      } else {
        toast.info(t(`Removed "${displayName}" from Wishlist`, `تم حذف "${displayName}" من المفضلة`));
      }
    } catch (err: any) {
      const isEarlyAccessMode = process.env.NEXT_PUBLIC_EARLY_ACCESS_MODE === 'true';
      if (isEarlyAccessMode) {
        toast.info(t('Store opening soon! Register for early access.', 'المتجر يفتح قريباً! سجّل اهتمامك لتصلك رسالة فور الإطلاق.'));
        setTimeout(() => {
          window.location.href = '/interest';
        }, 1000);
      } else {
        toast.error(t('Please log in or create an account to save items to your wishlist', 'يرجى تسجيل الدخول أو إنشاء حساب لحفظ المنتجات في المفضلة'));
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <div className="glass-card rounded-2xl p-3 flex flex-col justify-between h-full relative border border-slate-200/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div className="space-y-3">
          <div className="relative h-56 w-full overflow-hidden rounded-xl bg-slate-50">
            <Image 
              src={product.imageUrl} 
              alt={displayName} 
              fill 
              className="object-cover transition-transform duration-500 group-hover:scale-105" 
            />
            
            <div className="absolute top-3 left-3 z-10">
              <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
            </div>

            {/* Wishlist Heart Button (Shown ONLY when signed in) */}
            {isSignedIn && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWishlistToggle}
                className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
                  isWishlisted
                    ? 'bg-rose-500 text-white shadow-rose-500/30'
                    : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 hover:text-rose-500'
                }`}
                aria-label="Toggle Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </motion.button>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">{displayCategory}</p>
            <h3 className="line-clamp-1 text-sm font-extrabold text-black transition-colors">{displayName}</h3>
            <p className="line-clamp-2 text-xs text-slate-500 leading-relaxed min-h-[2.5rem]">{displayDescription}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
          <p className="text-sm font-black text-black">{formatPrice(product.price)}</p>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 group-hover:text-amber-600 flex items-center gap-1 transition-colors">
            {t('Details', 'التفاصيل')} <span>{t('→', '←')}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
