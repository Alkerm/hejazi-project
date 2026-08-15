'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';

export function HeroBanner() {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-cyan-500/15 border border-amber-500/20 p-8 sm:p-12 text-center space-y-4 backdrop-blur-md shadow-sm transition-all duration-300">
      {/* Vibrant Ambient Glow Effects */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[500px] rounded-full bg-amber-500/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-10 h-48 w-48 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-3 max-w-3xl mx-auto">
        {/* Clean Vibrant Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          {t('Half Link Energy & Security', 'هالف لينـك لأنظمة الطاقة وكاميرات المراقبة')}
        </h1>
        
        {/* Clean Vibrant Subtitle */}
        <p className="text-sm sm:text-base font-semibold text-amber-700 max-w-2xl mx-auto leading-relaxed">
          {t(
            'Solar Cameras, Gig Batteries & Energy Solutions for Homes & Camps',
            'كاميرات مراقبة بالطاقة الشمسية، بطاريات ليثيوم للمخيمات، وأنظمة طاقة هجينة متكاملة'
          )}
        </p>
      </div>
    </div>
  );
}
