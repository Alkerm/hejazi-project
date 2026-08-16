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
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-3">
        {/* Column 1: Brand & Overview */}
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="group inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-amber-400 font-mono text-base font-bold shadow-sm transition duration-300 group-hover:bg-amber-400 group-hover:text-slate-950 border border-amber-500/30">
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

          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {t(
              'High-performance solar energy solutions, heavy-duty lithium storage batteries, and smart 4K surveillance camera systems across the Kingdom of Saudi Arabia.',
              'حلول متكاملة لأنظمة الطاقة الشمسية ومحطات وبطاريات تخزين الكهرباء، وكاميرات المراقبة الأمنية الذكية 4K لخدمة المنازل والمخيمات والمزارع في جميع أنحاء المملكة.'
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
        <div className="space-y-4 md:col-span-1">
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

            <div className="pt-2">
              <span className="text-[10px] text-slate-400 block mb-1 font-semibold">{t('Accepted Payment Methods', 'طرق الدفع المعتمدة')}</span>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 shadow-2xs">مدى Mada</span>
                <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 shadow-2xs">Apple Pay</span>
                <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 shadow-2xs">Visa / Mastercard</span>
                <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 shadow-2xs">الدفع عند الاستلام (COD)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Contact Channels & Policies */}
        <div className="space-y-4 md:col-span-1">
          <h2 className="text-xs uppercase tracking-widest font-bold text-slate-800 border-b border-slate-200 pb-2">
            {t('Customer Support & Policies', 'خدمة العملاء والسياسات')}
          </h2>

          {/* Contact Details with explicit dir="ltr" to prevent flipping */}
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-500 shrink-0" />
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

            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">{t('Customer Support Email:', 'البريد الإلكتروني للدعم:')}</span>
                <a
                  href={`mailto:${storefrontSettings.email}`}
                  className="font-medium text-slate-800 hover:text-amber-600 transition underline"
                >
                  {storefrontSettings.email}
                </a>
              </div>
            </div>
          </div>

          {/* Policy Links */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              {t('Store Policies', 'سياسات الشراء والضمان')}
            </span>
            <nav className="grid grid-cols-1 gap-1.5 text-xs font-medium">
              {policyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-slate-600 hover:text-amber-600 hover:underline transition-colors duration-200 flex items-center gap-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-amber-400 inline-block" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
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
