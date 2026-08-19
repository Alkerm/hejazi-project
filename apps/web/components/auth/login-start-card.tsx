'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginStartCard() {
  const { t, lang } = useLanguage();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateField = (field: 'email' | 'password', val: string) => {
    let err: string | undefined;

    if (field === 'email') {
      const trimmed = val.trim();
      if (!trimmed) {
        err = t('Email address is required', 'البريد الإلكتروني مطلوب');
      } else if (!EMAIL_REGEX.test(trimmed)) {
        err = t('Please enter a valid email address (e.g. name@example.com)', 'يرجى إدخال بريد إلكتروني صحيح (مثال: name@example.com)');
      }
    } else if (field === 'password') {
      if (!val) {
        err = t('Password is required', 'كلمة المرور مطلوبة');
      } else if (val.length < 8) {
        err = t('Password must be at least 8 characters', 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل');
      }
    }

    return err;
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = field === 'email' ? email : password;
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateField('email', val) }));
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validateField('password', val) }));
    }
  };

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    setApiError(null);

    try {
      const user = await api.login({ email: loginEmail.trim(), password: loginPass });
      document.cookie = 'cosmetics_sid_hint=1; path=/';

      const targetUrl = user.role === 'ADMIN' ? '/admin' : user.role === 'DRIVER' ? '/driver' : '/products';
      window.location.href = targetUrl;
    } catch (e) {
      setApiError((e as Error).message);
      setLoading(false);
    }
  };

  const handleDemoLogin = (type: keyof typeof DEMO_CREDENTIALS) => {
    const creds = DEMO_CREDENTIALS[type];
    setEmail(creds.email);
    setPassword(creds.password);
    setErrors({});
    executeLogin(creds.email, creds.password);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    const emailErr = validateField('email', email);
    const passwordErr = validateField('password', password);

    setTouched({ email: true, password: true });
    setErrors({
      email: emailErr,
      password: passwordErr,
    });

    if (emailErr || passwordErr) {
      return;
    }

    executeLogin(email, password);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/products');
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 glass-card rounded-2xl p-8 border border-slate-200/40 animate-fade-in shadow-xl bg-white/95">
      {/* Back Button & Header Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-amber-600 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-amber-50/60 active:scale-95 cursor-pointer"
        >
          {lang === 'ar' ? (
            <>
              <ArrowRight className="w-4 h-4 text-amber-500" />
              <span>{t('Back to Store', 'الرجوع للمتجر')}</span>
            </>
          ) : (
            <>
              <ArrowLeft className="w-4 h-4 text-amber-500" />
              <span>{t('Back to Store', 'Back to Store')}</span>
            </>
          )}
        </button>

        <span className="text-[10px] font-semibold text-slate-400">
          <span className="text-rose-500 font-bold">*</span> {t('Required fields', 'حقول مطلوبة')}
        </span>
      </div>

      {/* Brand Header */}
      <div className="text-center space-y-2">
        <h1 className="serif-font text-3xl font-bold text-slate-800">
          {t('Welcome Back', 'مرحباً بك مجدداً')}
        </h1>
        <p className="text-xs uppercase tracking-widest text-amber-500 font-extrabold flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 inline" />
          {t('Half Link Energy & Security', 'هالف لينـك لأنظمة الطاقة وكاميرات المراقبة')}
        </p>
      </div>

      {/* Quick Demo Fill & Auto-Login Buttons */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-50/50 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {t('Quick Demo Auto-Login', 'أزرار الدخول السريع التجريبي')}
          </p>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">1-Click</span>
        </div>
        <div className="text-[10px] text-slate-600 space-y-0.5">
          <p><span className="font-semibold text-slate-800">Customer:</span> {DEMO_CREDENTIALS.customer.email}</p>
          <p><span className="font-semibold text-slate-800">Admin:</span> {DEMO_CREDENTIALS.admin.email}</p>
          <p><span className="font-semibold text-slate-800">Driver:</span> {DEMO_CREDENTIALS.driver.email}</p>
        </div>
        <div className="pt-1 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100 active:scale-95 transition shadow-sm cursor-pointer disabled:opacity-50"
            onClick={() => handleDemoLogin('customer')}
          >
            👤 {t('Customer', 'دخول العميل')}
          </button>
          <button
            type="button"
            disabled={loading}
            className="rounded-xl border border-purple-300 bg-purple-100 px-3 py-1.5 text-xs font-bold text-purple-900 hover:bg-purple-200 active:scale-95 transition shadow-sm cursor-pointer disabled:opacity-50"
            onClick={() => handleDemoLogin('admin')}
          >
            👑 {t('Admin', 'دخول الأدمن')}
          </button>
          <button
            type="button"
            disabled={loading}
            className="rounded-xl border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-200 active:scale-95 transition shadow-sm cursor-pointer disabled:opacity-50"
            onClick={() => handleDemoLogin('driver')}
          >
            🚚 {t('Driver', 'دخول السائق')}
          </button>
        </div>
      </div>

      {/* Global / API Error Alert */}
      {apiError && (
        <div className="flex items-start gap-2.5 text-xs font-semibold text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">{t('Sign In Failed', 'تعذر تسجيل الدخول')}</p>
            <p className="font-normal text-rose-600 mt-0.5">{apiError}</p>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Input
          label={t('Email Address', 'البريد الإلكتروني')}
          type="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="example@halflink.sa"
          required
          isRequired
          error={touched.email ? errors.email : undefined}
          leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          className="bg-white/80"
          autoComplete="email"
        />

        <div>
          <Input
            label={t('Password', 'كلمة المرور')}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            onBlur={() => handleBlur('password')}
            placeholder="••••••••"
            required
            isRequired
            error={touched.password ? errors.password : undefined}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-700 transition p-1 cursor-pointer"
                title={showPassword ? t('Hide password', 'إخفاء كلمة المرور') : t('Show password', 'إظهار كلمة المرور')}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            className="bg-white/80"
            autoComplete="current-password"
          />

          <div className="flex justify-end mt-1.5">
            <Link
              href="/forgot-password"
              className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 hover:underline transition"
            >
              {t('Forgot password?', 'نسيت كلمة المرور؟')}
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="dark"
          disabled={loading}
          className="w-full py-3.5 font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer text-amber-400"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>{t('Verifying & Logging In...', 'جاري التحقق والدخول...')}</span>
            </>
          ) : (
            <span className="text-amber-400 font-bold">{t('Sign In', 'تسجيل الدخول')}</span>
          )}
        </Button>
      </form>

      {/* Footer Links */}
      <div className="border-t border-slate-200/50 pt-4 text-center">
        <p className="text-xs text-slate-500">
          {t("Don't have an account?", 'ليس لديك حساب؟')}{' '}
          <Link href="/register" className="font-bold text-amber-600 hover:text-amber-700 hover:underline transition">
            {t('Create an account', 'أنشئ حساباً جديداً')}
          </Link>
        </p>
      </div>
    </div>
  );
}
