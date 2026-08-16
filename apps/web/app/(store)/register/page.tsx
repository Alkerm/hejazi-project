'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';

export default function RegisterPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    marketingConsent: false,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        marketingConsent: form.marketingConsent,
      });
      document.cookie = 'cosmetics_sid_hint=1; path=/';
      window.location.href = '/products';
    } catch (e) {
      setMessage((e as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 glass-card rounded-2xl p-8 border border-slate-200/40 animate-fade-in my-8">
      <div className="text-center space-y-2">
        <h1 className="serif-font text-3xl font-bold text-slate-800">
          {t('Create Account', 'إنشاء حساب جديد')}
        </h1>
        <p className="text-xs uppercase tracking-widest text-amber-500 font-extrabold">
          {t('Half Link Energy & Security', 'هالف لينـك لأنظمة الطاقة وكاميرات المراقبة')}
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('First Name', 'الاسم الأول')}
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            placeholder="فهد"
            required
            className="bg-white/80"
          />
          <Input
            label={t('Last Name', 'اسم العائلة')}
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            placeholder="العتيبي"
            required
            className="bg-white/80"
          />
        </div>
        <Input
          label={t('Email Address', 'البريد الإلكتروني')}
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="fahad@halflink.sa"
          required
          className="bg-white/80"
        />
        <Input
          label={t('Phone Number (Optional)', 'رقم الجوال (اختياري)')}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+966 50 000 0000"
          className="bg-white/80"
        />
        <Input
          label={t('Password', 'كلمة المرور')}
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••"
          required
          className="bg-white/80"
        />

        {message && (
          <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">{message}</p>
        )}

        <Button type="submit" disabled={loading} className="w-full py-3.5 bg-slate-950 hover:bg-amber-400 hover:text-slate-950 text-amber-400 border border-amber-500/30 font-bold transition shadow-md">
          {loading ? t('Creating Account...', 'جاري إنشاء الحساب...') : t('Create Account', 'إنشاء الحساب')}
        </Button>
      </form>

      <div className="border-t border-slate-200/50 pt-4 text-center">
        <p className="text-xs text-slate-500">
          {t('Already registered?', 'لديك حساب بالفعل؟')}{' '}
          <Link href="/login" className="font-bold text-amber-600 hover:text-amber-700 transition">
            {t('Sign in', 'تسجيل الدخول')}
          </Link>
        </p>
      </div>
    </div>
  );
}
