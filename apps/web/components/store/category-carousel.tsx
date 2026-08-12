'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Category } from '@/lib/types';
import { useLanguage } from '@/lib/language-context';

interface CategoryCarouselProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

const CATEGORY_IMAGES: Record<string, string> = {
  all: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop',
  skincare: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=600&auto=format&fit=crop',
  makeup: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=600&auto=format&fit=crop',
  fragrance: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=600&auto=format&fit=crop',
  haircare: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=600&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop',
};

const CATEGORY_ARABIC_NAMES: Record<string, string> = {
  all: 'جميع المنتجات',
  skincare: 'العناية بالبشرة',
  makeup: 'المكياج والتجميل',
  fragrance: 'العطور الفاخرة',
  haircare: 'العناية بالشعر',
};

export function CategoryCarousel({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryCarouselProps) {
  const { t, lang } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'prev' | 'next') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'next' ? 280 : -280;
      const finalAmount = lang === 'ar' ? -scrollAmount : scrollAmount;
      scrollContainerRef.current.scrollBy({ left: finalAmount, behavior: 'smooth' });
    }
  };

  const allCategoryItem = {
    id: 'all',
    slug: '',
    name: 'All Products',
  };

  const items = [allCategoryItem, ...categories];

  return (
    <div className="relative space-y-3 py-2 w-full">
      {/* Header & Scroll Buttons */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h2 className="text-xs uppercase tracking-widest font-bold text-slate-800">
            {t('Browse Categories', 'تصفح حسب الفئة')}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleScroll('prev')}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white shadow-2xs text-slate-600 hover:bg-slate-50 active:scale-95 transition"
            aria-label="Previous Categories"
          >
            {lang === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => handleScroll('next')}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white shadow-2xs text-slate-600 hover:bg-slate-50 active:scale-95 transition"
            aria-label="Next Categories"
          >
            {lang === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Auto-adapting Full Width & Horizontally Scrollable Track */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3.5 overflow-x-auto py-2 px-0.5 scroll-smooth w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          const imageSrc =
            CATEGORY_IMAGES[cat.slug || 'all'] || CATEGORY_IMAGES.default;
          const arabicName =
            CATEGORY_ARABIC_NAMES[cat.slug || 'all'] || cat.name;

          return (
            <button
              key={cat.id || cat.slug}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className={`group relative flex-1 min-w-[130px] sm:min-w-[160px] h-40 sm:h-48 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 focus:outline-none ${
                isSelected
                  ? 'ring-2 ring-amber-500 scale-[1.02] shadow-md border-transparent'
                  : 'hover:scale-[1.01] hover:shadow-md border border-slate-200/70 bg-white'
              }`}
            >
              {/* Background Image */}
              <img
                src={imageSrc}
                alt={cat.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

              {/* Category Title Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-3 text-center text-white space-y-0.5">
                <p className="text-xs sm:text-sm font-bold leading-tight drop-shadow-sm">
                  {lang === 'ar' ? arabicName : cat.name}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
