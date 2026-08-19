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
      href: '#',
      icon: (props: any) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      hoverClass: 'hover:bg-black hover:text-white hover:border-black',
    },
    {
      name: 'Instagram',
      href: '#',
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
      href: '#',
      icon: (props: any) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
      hoverClass: 'hover:bg-black hover:text-white hover:border-black',
    },
    {
      name: 'Snapchat',
      href: '#',
      icon: (props: any) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M12.03 2c-3.35 0-5.83 2.45-5.83 5.76 0 .84.22 2.12.77 3.27-.47.16-.99.37-1.35.79-.39.46-.42 1.05-.18 1.54.29.6 1.01.8 1.74.88-.13.33-.28.69-.47 1.05-.59 1.11-1.47 1.64-2.48 1.68-.42.02-.75.29-.8.71-.05.47.24.93.71 1.11 1.25.48 2.61.42 3.84-.04.6-.22 1.19-.52 1.78-.85.73.49 1.57.77 2.43.78.85-.01 1.69-.29 2.42-.78.59.33 1.18.63 1.78.85 1.23.46 2.59.52 3.84.04.47-.18.76-.64.71-1.11-.05-.42-.38-.69-.8-.71-1.01-.04-1.89-.57-2.48-1.68-.19-.36-.34-.72-.47-1.05.73-.08 1.45-.28 1.74-.88.24-.49.21-1.08-.18-1.54-.36-.42-.88-.63-1.35-.79.55-1.15.77-2.43.77-3.27C17.86 4.45 15.38 2 12.03 2z" />
        </svg>
      ),
      hoverClass: 'hover:bg-[#FFFC00] hover:text-black hover:border-yellow-400',
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/${storefrontSettings.phoneClean}`,
      icon: (props: any) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.79 14.12c-.24.67-1.39 1.29-1.92 1.37-.5.08-1.13.12-3.66-.93-3.23-1.34-5.27-4.63-5.43-4.85-.16-.21-1.3-1.73-1.3-3.3 0-1.57.82-2.35 1.11-2.67.29-.32.63-.4.84-.4.21 0 .42.01.6.01.19.01.44-.07.69.53.25.6.86 2.09.93 2.24.08.16.13.35.03.55-.1.21-.15.34-.3.51-.15.17-.32.38-.46.51-.15.14-.31.3-.13.6.17.3 1.09 1.8 2.34 2.91 1.61 1.43 2.97 1.87 3.39 2.08.42.21.67.18.92-.1.25-.29 1.06-1.24 1.34-1.66.29-.42.57-.35.96-.21.39.14 2.48 1.17 2.91 1.38.42.21.71.32.81.49.1.18.1 1.02-.14 1.69z" />
        </svg>
      ),
      hoverClass: 'hover:bg-[#25D366] hover:text-white hover:border-emerald-500',
    },
    {
      name: 'YouTube',
      href: '#',
      icon: (props: any) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      hoverClass: 'hover:bg-[#FF0000] hover:text-white hover:border-red-600',
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
              <span className="text-[9px] tracking-[0.25em] font-extrabold text-amber-500 uppercase mt-0.5">
                HEJAZI COSMETICS
              </span>
            </div>
          </Link>

          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {t(
              'Premium cosmetics, luxury perfumes, and beauty care products across the Kingdom of Saudi Arabia.',
              'منتجات العناية والتجميل والعطور الفاخرة لخدمة عملائنا في جميع أنحاء المملكة العربية السعودية.'
            )}
          </p>

          {/* Official Company Name */}
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70 text-xs space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t('Official Registered Taxpayer Name', 'الاسم التجاري النظامي للمنشأة')}
            </p>
            <p className="font-bold text-slate-800 text-sm">
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

            {/* Social Media App Buttons */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                {t('Follow Us:', 'تابعنا على مواقع التواصل:')}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    title={social.name}
                    className={`flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 shadow-2xs transition-all duration-300 hover:scale-110 hover:shadow-md cursor-pointer ${social.hoverClass}`}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
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
