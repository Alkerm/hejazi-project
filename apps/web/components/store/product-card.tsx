'use client';

import React, { useState } from 'react';
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
  const stockStatus = getStockStatus(product.stockQuantity, lang);

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
      toast.error(err.message || t('Please log in to save items to your wishlist', 'يرجى تسجيل الدخول لحفظ المنتجات في المفضلة'));
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

            {/* Wishlist Heart Button */}
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
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">{displayCategory}</p>
            <h3 className="line-clamp-1 text-sm font-bold text-slate-800 transition-colors group-hover:text-emerald-600">{displayName}</h3>
            <p className="line-clamp-2 text-xs text-slate-500 leading-relaxed min-h-[2.5rem]">{displayDescription}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
          <p className="text-sm font-bold text-slate-800">{formatPrice(product.price)}</p>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1 transition-colors">
            {t('Details', 'التفاصيل')} <span>{t('→', '←')}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
