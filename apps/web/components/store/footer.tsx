'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

export function Footer() {
  const { t } = useLanguage();

  const policyLinks = [
    { href: '/terms', label: t('Terms & Conditions', 'الشروط والأحكام') },
    { href: '/privacy', label: t('Privacy Policy', 'سياسة الخصوصية') },
    { href: '/shipping-delivery', label: t('Shipping & Delivery', 'الشحن والتوصيل') },
    { href: '/returns-refunds', label: t('Returns & Refunds', 'الإرجاع والاستبدال') },
    { href: '/complaints-contact', label: t('Complaints & Contact', 'الشكاوى والتواصل') },
  ];

  return (
    <footer className="mt-20 border-t border-slate-200/60 bg-white/60 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.5fr_1fr]">
        {/* Brand Info & Entity Details */}
        <div className="space-y-5">
          <Link href="/" className="group inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-amber-400 font-mono text-base font-bold shadow-sm transition duration-300 group-hover:bg-amber-400 group-hover:text-slate-950 border border-amber-500/30">
              HL
            </div>
            <div className="flex flex-col leading-none">
              <span className="serif-font text-xl font-bold tracking-widest text-slate-900 transition duration-300 group-hover:text-amber-600">
                HALF LINK
              </span>
              <span className="text-[9px] tracking-[0.25em] font-extrabold text-amber-500 uppercase mt-0.5">
                ENERGY & SECURITY
              </span>
            </div>
          </Link>

          <p className="max-w-md text-xs text-slate-500 leading-relaxed font-normal">
            {t(
              'High-tech surveillance security cameras, solar energy systems, and heavy-duty power station batteries for homes and desert camps.',
              'أحدث كاميرات المراقبة الذكية ومحطات الطاقة والبطاريات الضخمة لتغذية المنازل والمخيمات والمزارع بالكهرباء المستدامة.'
            )}
          </p>

          <div className="grid gap-2.5 text-xs text-slate-600 sm:grid-cols-2 pt-1 border-t border-slate-100">
            <p>
              <span className="font-bold text-slate-800">{t('Entity:', 'المنشأة:')}</span> {t('Half Link Security & Energy', 'مؤسسة هالف لينـك لكاميرات المراقبة وحلول الطاقة')}
            </p>
            <p>
              <span className="font-bold text-slate-800">{t('CR No:', 'السجل التجاري:')}</span> 1010789012
            </p>
            <p>
              <span className="font-bold text-slate-800">{t('Email:', 'البريد الإلكتروني:')}</span> support@halflink.sa
            </p>
            <p>
              <span className="font-bold text-slate-800">{t('Phone:', 'الهاتف:')}</span> +966 50 123 4567
            </p>
            <p className="sm:col-span-2">
              <span className="font-bold text-slate-800">{t('Address:', 'العنوان:')}</span> {t('Riyadh, Kingdom of Saudi Arabia', 'الرياض، المملكة العربية السعودية')}
            </p>
          </div>
        </div>

        {/* Store Policies & Links */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-bold text-slate-800 border-b border-slate-100 pb-2">
            {t('Store Policies & Info', 'سياسات المتجر والمعلومات')}
          </h2>
          <nav className="grid gap-2.5 sm:grid-cols-2 text-xs font-medium">
            {policyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-600 hover:text-amber-600 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-slate-200/40 py-6 text-center text-[10px] font-medium text-slate-400">
        © {new Date().getFullYear()} {t('Half Link. All rights reserved.', 'هالف لينـك. جميع الحقوق محفوظة.')}
      </div>
    </footer>
  );
}
