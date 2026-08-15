'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';
import { Zap, Sun, Camera, ShieldCheck } from 'lucide-react';

export function HeroBanner() {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-[#0b1329] to-slate-950 border border-amber-500/25 p-8 sm:p-12 text-center space-y-6 shadow-2xl shadow-black/50 transition-all duration-300">
      {/* High-Tech Glowing Energy Ambient Backlights */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[480px] rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-10 h-40 w-40 rounded-full bg-yellow-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

      {/* Subtle Circuit Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
        {/* Top High-Tech Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{t('Certified Solar Energy & Smart Security Systems', 'الوجهة المعتمدة لحلول الطاقة الشمسية وكاميرات المراقبة بالمملكة')}</span>
        </div>

        {/* Clean High-Contrast Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          {t('Half Link Energy & Security', 'هالف لينـك لأنظمة الطاقة وكاميرات المراقبة')}
        </h1>
        
        {/* Crisp Subtitle */}
        <p className="text-sm sm:text-base font-normal text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {t(
            'Solar Security Cameras, Lithium Battery Banks & Integrated Hybrid Power Systems for Homes & Camps',
            'كاميرات مراقبة بالطاقة الشمسية، بطاريات ليثيوم للمخيمات والمنازل، وأنظمة طاقة هجينة متكاملة'
          )}
        </p>

        {/* 3 High-Tech Feature Micro-Badges */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-2 bg-slate-900/90 text-slate-200 border border-slate-700/60 px-3.5 py-2 rounded-xl backdrop-blur-sm shadow-sm">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>{t('Solar Panels & LiFePO4 Banks', 'طاقة شمسية وبطاريات LiFePO4')}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 text-slate-200 border border-slate-700/60 px-3.5 py-2 rounded-xl backdrop-blur-sm shadow-sm">
            <Camera className="w-4 h-4 text-amber-400" />
            <span>{t('4G Smart 360° AI Cameras', 'كاميرات مراقبة 4G ذكية 360°')}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 text-slate-200 border border-slate-700/60 px-3.5 py-2 rounded-xl backdrop-blur-sm shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t('2-Year Official Warranty', 'ضمان سنتين معتمد بالمملكة')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
