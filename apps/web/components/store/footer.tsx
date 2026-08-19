'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Building2, ShieldCheck, FileCheck, CreditCard, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { storefrontSettings } from '@/lib/storefront';

export function Footer() {
  const { t, lang } = useLanguage();

  const policyLinks = [
    { href: '/terms', label: t('Terms & Conditions', 'الشروط والأحكام') },
    { href: '/privacy', label: t('Privacy Policy', 'سياسة الخصوصية') },
    { href: '/shipping-delivery', label: t('Shipping & Delivery', 'الشحن والتوصيل') },
    { href: '/returns-refunds', label: t('Returns, Refunds & Warranty', 'الإرجاع والاستبدال والضمان') },
    { href: '/complaints-contact', label: t('Complaints & Customer Care', 'الشكاوى وخدمة العملاء') },
  ];

  const socialLinks = [
    {
      name: 'X (Twitter)',
      href: 'https://x.com/halflink_sa',
      icon: (props: any) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      hoverClass: 'hover:bg-black hover:text-white hover:border-black',
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/halflink_sa',
      icon: (props: any) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      ),
      hoverClass: 'hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white hover:border-rose-400',
    },
    {
      name: 'TikTok',
      href: 'https://tiktok.com/@halflink_sa',
      icon: (props: any) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
      hoverClass: 'hover:bg-black hover:text-white hover:border-black',
    },
  ];

  return (
    <footer className="mt-20 border-t border-slate-200/70 bg-white/90 backdrop-blur-md shadow-inner">
      {/* Top Value / Trust Highlights */}
      <div className="border-b border-slate-100 bg-amber-50/40 py-4">
        <div className="mx-auto max-w-6xl px-6 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('Certified Saudi Commercial Entity', 'منشأة سعودية رسمية موثقة ومعتمدة')}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{t('15% VAT Registered by ZATCA', 'مسجل بضريبة القيمة المضافة 15% (هيئة الزكاة والضريبة)')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{t('Authentic Solar & Security Systems', 'أنظمة طاقة شمسية وكاميرات مراقبة أصلية')}</span>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Column 1: Brand & Overview */}
        <div className="space-y-4">
          <Link href="/" className="group inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-amber-400 font-mono text-base font-bold shadow-sm transition duration-300 group-hover:bg-amber-400 group-hover:text-slate-950 border border-amber-500/30">
              HL
            </div>
            <div className="flex flex-col leading-none">
              <span className="serif-font text-xl font-bold tracking-widest text-slate-900 transition duration-300 group-hover:text-amber-600">
                HALF LINK
              </span>
              <span className="text-[9px] tracking-[0.2em] font-extrabold text-amber-500 uppercase mt-0.5">
                ENERGY & SECURITY
              </span>
            </div>
          </Link>

          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {t(
              'Smart solar surveillance cameras, certified LiFePO4 batteries, and sustainable energy power stations in Saudi Arabia.',
              'أنظمة المراقبة الذكية، كاميرات الطاقة الشمسية، ومحطات وبطاريات الليثيوم المعتمدة في المملكة العربية السعودية.'
            )}
          </p>

          {/* Social Media Links (X, Instagram, TikTok Only) */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
              {t('Follow Us:', 'تابعنا على مواقع التواصل:')}
            </span>
            <div className="flex items-center gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 shadow-2xs transition-all duration-300 hover:scale-110 hover:shadow-md cursor-pointer ${social.hoverClass}`}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Official Company Name */}
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70 text-xs space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t('Official Registered Taxpayer Name', 'الاسم التجاري النظامي للمنشأة')}
            </p>
            <p className="font-bold text-slate-800 text-xs">
              {lang === 'ar' ? storefrontSettings.legalEntityNameArabic : storefrontSettings.legalEntityName}
            </p>
          </div>
        </div>

        {/* Column 2: Official Government & Legal Information */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>{t('Commercial & Tax Compliance', 'البيانات التجارية والضريبية')}</span>
          </h2>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-start justify-between border-b border-slate-100 pb-1.5">
              <span className="font-medium text-slate-500">{t('Commercial Registration (CR):', 'رقم السجل التجاري:')}</span>
              <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded-md">
                {storefrontSettings.crNumber}
              </span>
            </div>

            <div className="flex items-start justify-between border-b border-slate-100 pb-1.5">
              <span className="font-medium text-slate-500">{t('VAT Registration Number:', 'رقم التسجيل الضريبي:')}</span>
              <span className="font-mono font-bold text-slate-900 text-xs bg-amber-50 text-amber-900 border border-amber-200/60 px-2 py-0.5 rounded-md">
                {storefrontSettings.vatNumber}
              </span>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block text-[11px]">{t('Registered Address:', 'العنوان الوطني والمقر:')}</span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {lang === 'ar' ? storefrontSettings.addressArabic : storefrontSettings.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Contact Channels */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-amber-500" />
            <span>{t('Customer Support', 'خدمة العملاء والتواصل')}</span>
          </h2>

          <div className="space-y-3.5 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">{t('Direct Phone / WhatsApp:', 'الهاتف المباشر / واتساب:')}</span>
                <a
                  href={`tel:${storefrontSettings.phoneClean}`}
                  className="font-mono font-bold text-slate-900 hover:text-amber-600 transition"
                >
                  <span dir="ltr" className="inline-block tracking-wide">
                    {storefrontSettings.phone}
                  </span>
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">{t('Customer Support Email:', 'البريد الإلكتروني للدعم:')}</span>
                <a
                  href={`mailto:${storefrontSettings.email}`}
                  className="font-medium text-slate-800 hover:text-amber-600 transition underline break-all"
                >
                  {storefrontSettings.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Column 4: Store Policies */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-bold text-slate-800 border-b border-slate-200 pb-2">
            {t('Store Policies', 'سياسات الشراء والضمان')}
          </h2>

          <nav className="grid grid-cols-1 gap-2 text-xs font-medium">
            {policyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-600 hover:text-amber-600 hover:underline transition-colors duration-200 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block shrink-0" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Saudi VAT & Compliance Notice */}
      <div className="border-t border-slate-200/50 bg-slate-50 py-3 text-center text-[11px] text-slate-500 px-4">
        {t(
          'All product prices listed include 15% Value Added Tax (VAT) in accordance with ZATCA regulations.',
          'جميع الأسعار المعروضة بالمتجر تشمل ضريبة القيمة المضافة (15%) بموجب أنظمة هيئة الزكاة والضريبة والجمارك (ZATCA).'
        )}
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-slate-200/60 py-5 text-center text-xs font-medium text-slate-400">
        © {new Date().getFullYear()} {t('Half Link Marketing Co. (شركة هاف لينك للتسويق). All rights reserved.', 'شركة هاف لينك للتسويق (Half Link). جميع الحقوق محفوظة.')}
      </div>
    </footer>
  );
}
