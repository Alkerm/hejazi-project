'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, ShieldCheck, ScrollText, CheckCircle2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { storefrontSettings } from '@/lib/storefront';
import { useLanguage } from '@/lib/language-context';
import { StorePolicy } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function ComplaintsContactPage() {
  const { t, lang } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [policy, setPolicy] = useState<StorePolicy | null>(null);

  useEffect(() => {
    api
      .getPolicyBySlug('complaints-contact')
      .then((data) => setPolicy(data))
      .catch(() => {});
  }, []);

  const isAr = lang === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error(t('All fields are required.', 'جميع الحقول مطلوبة لإرسال الرسالة.'));
      return;
    }

    setSubmitting(true);

    try {
      await api.submitContactTicket({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      toast.success(
        t(
          'Your support inquiry has been submitted! Our team will respond shortly.',
          'تم استلام تذكرتك بنجاح! سيقوم فريق خدمة العملاء بالرد عليك في أقرب وقت.'
        )
      );
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      toast.error(err.message || t('Failed to submit inquiry', 'تعذر إرسال التذكرة'));
    } finally {
      setSubmitting(false);
    }
  };

  const policyTitle = isAr
    ? policy?.titleAr || 'سياسة الشكاوى وخدمة العملاء'
    : policy?.titleEn || 'Complaints & Customer Care Policy';

  const policyContent = isAr ? policy?.contentAr : policy?.contentEn;

  return (
    <div className="space-y-10 animate-fade-in max-w-5xl mx-auto pb-16">
      <Toaster position="top-center" richColors />

      {/* Hero Title */}
      <div className="border-b border-slate-200/70 pb-6 space-y-2">
        <h1 className="serif-font text-3xl md:text-4xl font-bold text-slate-900">
          {t('Complaints & Customer Support', 'الشكاوى وخدمة العملاء')}
        </h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest">
          {t(
            'Report order issues, technical setup inquiries, or general warranty support',
            'رفع الشكاوى، الاستفسار عن الشحنات والطلبات، وخدمات الضمان والدعم الفني'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-6 md:col-span-1">
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 bg-white space-y-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2.5">
              {t('Official Support Channels', 'قنوات التواصل الرسمية')}
            </h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">{t('Email Support', 'البريد الإلكتروني')}</span>
                  <a
                    href={`mailto:${storefrontSettings.email}`}
                    className="text-slate-600 hover:text-amber-600 underline font-medium"
                  >
                    {storefrontSettings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">{t('Hotline / WhatsApp', 'الهاتف والواتساب')}</span>
                  <a
                    href={`tel:${storefrontSettings.phoneClean}`}
                    className="text-slate-600 hover:text-amber-600"
                  >
                    <span dir="ltr" className="inline-block font-mono font-bold">
                      {storefrontSettings.phone}
                    </span>
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">{t('Headquarters', 'المقر الرئيسي')}</span>
                  <p className="font-medium text-slate-600">{storefrontSettings.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-emerald-200/80 bg-emerald-50/40 space-y-2 text-xs text-emerald-900 shadow-sm">
            <h4 className="font-black uppercase tracking-wider flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('Care Response SLA', 'سرعة الاستجابة المعتمدة')}</span>
            </h4>
            <p className="leading-relaxed">
              {t(
                'We acknowledge customer tickets within 2-4 hours and provide definitive resolution within 24-48 business hours.',
                'نلتزم بتأكيد استلام الشكاوى خلال ٢ إلى ٤ ساعات وتقديم الحل النهائي خلال ٢٤ إلى ٤٨ ساعة عمل.'
              )}
            </p>
          </div>
        </div>

        {/* Contact / Ticket Submission Form */}
        <div className="md:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 bg-white space-y-4 shadow-sm"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                {t('Submit Support Ticket / Complaint', 'إرسال تذكرة دعم أو شكوى')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {t('Your Full Name:', 'الاسم الكامل:')}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('e.g. Sara Al-Otaibi', 'مثال: سارة العتيبي')}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {t('Email Address:', 'البريد الإلكتروني:')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sara@example.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs font-medium"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="font-bold text-slate-700 block mb-1">
                {t('Subject / Inquiry Topic:', 'موضوع الشكوى أو الاستفسار:')}
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t(
                  'e.g. Order Delivery Status or Warranty Replacement',
                  'مثال: متابعة شحنة طلب أو استفسار عن الضمان'
                )}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs font-medium"
              />
            </div>

            <div className="text-xs">
              <label className="font-bold text-slate-700 block mb-1">
                {t('Message Details:', 'تفاصيل الرسالة أو الشكوى:')}
              </label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t(
                  'Please describe your question, complaint, or issue in detail...',
                  'يرجى كتابة تفاصيل الاستفسار أو الشكوى بوضوح...'
                )}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs font-medium"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 px-6 text-xs flex items-center justify-center gap-2 rounded-xl shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? t('Submitting Ticket...', 'جاري الإرسال...') : t('Send Support Message', 'إرسال التذكرة')}</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Official Complaints Policy Section */}
      {policyContent && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-200/80 bg-white space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-black text-slate-900">{policyTitle}</h2>
          </div>
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-xs sm:text-sm whitespace-pre-line space-y-3 font-sans">
            {policyContent}
          </div>
        </div>
      )}
    </div>
  );
}
