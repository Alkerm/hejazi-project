'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { storefrontSettings } from '@/lib/storefront';
import { api } from '@/lib/api';
import { toast, Toaster } from 'sonner';
import { Sparkles, Send, CheckCircle2, Phone, MapPin, User, ChevronDown } from 'lucide-react';

const SAUDI_CITIES = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام',
  'الخبر', 'الظهران', 'تبوك', 'أبها', 'القصيم', 'حائل',
  'جازان', 'نجران', 'الباحة', 'عرعر', 'سكاكا',
  'Riyadh', 'Jeddah', 'Makkah', 'Madinah', 'Dammam', 'Khobar', 'Other',
];

const INTERESTS = [
  { ar: 'كاميرات المراقبة', en: 'Surveillance Cameras' },
  { ar: 'أنظمة الطاقة الشمسية', en: 'Solar Power Systems' },
  { ar: 'بطاريات LiFePO4', en: 'LiFePO4 Batteries' },
  { ar: 'محولات الطاقة (إنفيرتر)', en: 'Power Inverters' },
  { ar: 'أنظمة أمنية متكاملة', en: 'Complete Security Systems' },
];

export default function InterestPage() {
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !city) {
      toast.error(t('Please fill all required fields.', 'يرجى تعبئة جميع الحقول المطلوبة.'));
      return;
    }

    setSubmitting(true);
    try {
      await api.submitContactTicket({
        name: name.trim(),
        email: `interest+${phone.replace(/\s/g, '')}@halflink.sa`,
        subject: `[Early Access] ${name.trim()} — ${city}`,
        message: `📍 City: ${city}\n📦 Interests: ${selectedInterests.join(', ') || 'General'}\n📱 Phone: ${phone}`,
      });
      setSubmitted(true);
    } catch {
      toast.error(t('Something went wrong. Please try again.', 'حدث خطأ. يرجى المحاولة مرة أخرى.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-5 px-4 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="serif-font text-3xl font-black text-slate-900">
          {t("You're on the list!", 'تم تسجيلك بنجاح!')}
        </h1>
        <p className="text-sm text-slate-600 max-w-md leading-relaxed">
          {t(
            "Thank you for your interest! We'll reach out to you on WhatsApp as soon as the store launches.",
            'شكراً لاهتمامك! سنتواصل معك عبر الواتساب فور إطلاق المتجر.'
          )}
        </p>
        <a
          href={`https://wa.me/${storefrontSettings.phoneClean}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-md transition"
        >
          <Phone className="w-4 h-4" />
          {t('Chat with us on WhatsApp', 'تواصل معنا على الواتساب')}
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8 animate-fade-in">
      <Toaster position="top-center" richColors />

      {/* Hero */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          {t('Coming Soon', 'قريباً')}
        </span>
        <h1 className="serif-font text-3xl md:text-4xl font-black text-slate-900 leading-tight">
          {t('Get Early Access', 'سجّل اهتمامك الآن')}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
          {t(
            'Half Link is launching soon with premium solar cameras, LiFePO4 batteries, and integrated security systems. Register now to be first in line.',
            'هاف لينك تطلق قريباً أنظمة كاميرات الطاقة الشمسية، بطاريات LiFePO4، وأنظمة الأمن المتكاملة. سجّل اهتمامك الآن لتكون أول من يعلم.'
          )}
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="glass-card rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 space-y-5 shadow-sm"
      >
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-500" />
            {t('Full Name *', 'الاسم الكامل *')}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('e.g. Abdullah Al-Otaibi', 'مثال: عبدالله العتيبي')}
            className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm font-medium"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-amber-500" />
            {t('WhatsApp / Phone Number *', 'رقم الواتساب / الجوال *')}
          </label>
          <input
            type="tel"
            required
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05xxxxxxxx"
            className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm font-medium font-mono"
          />
        </div>

        {/* City */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            {t('City *', 'المدينة *')}
          </label>
          <div className="relative">
            <select
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm font-medium appearance-none bg-white"
            >
              <option value="">{t('Select your city', 'اختر مدينتك')}</option>
              {SAUDI_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">
            {t('What are you interested in? (optional)', 'ما الذي تبحث عنه؟ (اختياري)')}
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((item) => {
              const label = isAr ? item.ar : item.en;
              const active = selectedInterests.includes(label);
              return (
                <button
                  key={item.en}
                  type="button"
                  onClick={() => toggleInterest(label)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition cursor-pointer ${active
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-slate-950 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-black py-3.5 px-6 text-sm flex items-center justify-center gap-2 rounded-2xl shadow-md transition-all duration-200 cursor-pointer border border-amber-500/30"
        >
          <Send className="w-4 h-4" />
          {submitting
            ? t('Submitting...', 'جاري الإرسال...')
            : t('Register My Interest', 'سجّل اهتمامي')}
        </button>

        <p className="text-center text-[11px] text-slate-400">
          {t(
            'We respect your privacy. No spam — only a launch notification.',
            'نحترم خصوصيتك. لن نرسل إلا إشعار الإطلاق فقط.'
          )}
        </p>
      </form>
    </div>
  );
}
