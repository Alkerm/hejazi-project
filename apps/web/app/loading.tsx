'use client';

import { useLanguage } from '@/lib/language-context';

export default function GlobalLoading() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-24 space-y-4 animate-fade-in">
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-amber-500 animate-spin"></div>
        <span className="absolute serif-font text-xs font-extrabold text-slate-800">H</span>
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-600 animate-pulse">
        {t('Loading...', 'جاري التحميل...')}
      </p>
    </div>
  );
}
