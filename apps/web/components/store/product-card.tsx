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
  const { formatProductName, formatPrice, t } = useLanguage();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isToggling, setIsToggling] = useState(false);
  const stockStatus = getStockStatus(product.stockQuantity);

  const displayName = formatProductName(product);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isToggling) return;
    setIsToggling(true);

    try {
      const res = await api.toggleWishlist(product.id);
      setIsWishlisted(res.isWishlisted);
      if (res.isWishlisted) {
        toast.success(`Saved "${displayName}" to your Wishlist`);
      } else {
        toast.info(`Removed "${displayName}" from Wishlist`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Please log in to save items to your wishlist');
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">{product.category.name}</p>
            <h3 className="line-clamp-1 text-sm font-bold text-slate-800 transition-colors group-hover:text-emerald-600">{displayName}</h3>
            <p className="line-clamp-2 text-xs text-slate-500 leading-relaxed h-8">{product.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
          <p className="text-sm font-bold text-slate-800">{formatPrice(product.price)}</p>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1 transition-colors">
            {t('Details', 'التفاصيل')} <span>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
