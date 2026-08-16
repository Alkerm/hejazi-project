'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';

const DEFAULT_DEMO_PASS = process.env.NEXT_PUBLIC_DEMO_PASS || 'HalfLink2026!';

const DEMO_CREDENTIALS = {
  customer: {
    email: 'customer@cosmetics.local',
    password: DEFAULT_DEMO_PASS,
  },
  admin: {
    email: 'admin@cosmetics.local',
    password: DEFAULT_DEMO_PASS,
  },
  driver: {
    email: 'driver@cosmetics.local',
    password: DEFAULT_DEMO_PASS,
  },
} as const;

export function LoginStartCard() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const user = await api.login({ email: loginEmail, password: loginPass });
      document.cookie = 'cosmetics_sid_hint=1; path=/';
      
      const targetUrl = user.role === 'ADMIN' ? '/admin' : user.role === 'DRIVER' ? '/driver' : '/products';
      window.location.href = targetUrl;
    } catch (e) {
      setMessage((e as Error).message);
      setLoading(false);
    }
  };

  const handleDemoLogin = (type: keyof typeof DEMO_CREDENTIALS) => {
    const creds = DEMO_CREDENTIALS[type];
    setEmail(creds.email);
    setPassword(creds.password);
    executeLogin(creds.email, creds.password);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    executeLogin(email, password);
  };

  return (
    <div className="mx-auto max-w-md space-y-6 glass-card rounded-2xl p-8 border border-slate-200/40 animate-fade-in">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <h1 className="serif-font text-3xl font-bold text-slate-800">
          {t('Welcome Back', 'مرحباً بك مجدداً')}
        </h1>
        <p className="text-xs uppercase tracking-widest text-amber-500 font-extrabold">
          {t('Half Link Energy & Security', 'هالف لينـك لأنظمة الطاقة وكاميرات المراقبة')}
        </p>
      </div>

      {/* Quick Demo Fill & Auto-Login Buttons */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-50/40 p-4 space-y-2">
        <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {t('Quick Demo Auto-Login Buttons', 'أزرار الدخول السريع التجريبي')}
        </p>
        <div className="text-[10px] text-slate-600 space-y-1">
          <p><span className="font-semibold text-slate-800">Customer:</span> {DEMO_CREDENTIALS.customer.email}</p>
          <p><span className="font-semibold text-slate-800">Admin:</span> {DEMO_CREDENTIALS.admin.email}</p>
          <p><span className="font-semibold text-slate-800">Driver:</span> {DEMO_CREDENTIALS.driver.email}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button 
            type="button" 
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 active:scale-95 transition shadow-sm cursor-pointer disabled:opacity-50"
            onClick={() => handleDemoLogin('customer')}
          >
            👤 {t('Customer Log', 'دخول العميل')}
          </button>
          <button 
            type="button" 
            disabled={loading}
            className="rounded-xl border border-purple-300 bg-purple-100 px-3.5 py-2 text-xs font-bold text-purple-900 hover:bg-purple-200 active:scale-95 transition shadow-sm cursor-pointer disabled:opacity-50"
            onClick={() => handleDemoLogin('admin')}
          >
            👑 {t('Admin Log', 'دخول الأدمن')}
          </button>
          <button 
            type="button" 
            disabled={loading}
            className="rounded-xl border border-amber-300 bg-amber-100 px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-200 active:scale-95 transition shadow-sm cursor-pointer disabled:opacity-50"
            onClick={() => handleDemoLogin('driver')}
          >
            🚚 {t('Driver Log', 'دخول السائق')}
          </button>
        </div>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <Input
          label={t('Email Address', 'البريد الإلكتروني')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@halflink.sa"
          required
          className="bg-white/80"
        />
        <Input
          label={t('Password', 'كلمة المرور')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="bg-white/80"
        />
        
        {message && (
          <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">{message}</p>
        )}

        <Button type="submit" disabled={loading} className="w-full py-3.5 bg-slate-950 hover:bg-amber-400 hover:text-slate-950 text-amber-400 border border-amber-500/30 font-bold transition shadow-md">
          {loading ? t('Verifying & Logging In...', 'جاري التحقق والدخول...') : t('Sign In', 'تسجيل الدخول')}
        </Button>
      </form>

      <div className="border-t border-slate-200/50 pt-4 text-center">
        <p className="text-xs text-slate-500">
          {t("Don't have an account?", 'ليس لديك حساب؟')}{' '}
          <Link href="/register" className="font-bold text-amber-600 hover:text-amber-700 transition">
            {t('Create an account', 'أنشئ حساباً جديداً')}
          </Link>
        </p>
      </div>
    </div>
  );
}
