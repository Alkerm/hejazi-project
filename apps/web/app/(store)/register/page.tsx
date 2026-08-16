'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,8}$/;

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  marketingConsent: boolean;
}

type FormFieldKey = keyof FormState;

export default function RegisterPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    marketingConsent: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Partial<Record<FormFieldKey, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FormFieldKey, boolean>>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateField = (field: FormFieldKey, value: any, currentForm: FormState = form): string | undefined => {
    switch (field) {
      case 'firstName': {
        const val = (value as string).trim();
        if (!val) {
          return t('First name is required', 'الاسم الأول مطلوب');
        }
        if (val.length < 2) {
          return t('First name must be at least 2 characters', 'يجب أن يتكون الاسم الأول من حرفين على الأقل');
        }
        return undefined;
      }
      case 'lastName': {
        const val = (value as string).trim();
        if (!val) {
          return t('Last name is required', 'اسم العائلة مطلوب');
        }
        if (val.length < 2) {
          return t('Last name must be at least 2 characters', 'يجب أن يتكون اسم العائلة من حرفين على الأقل');
        }
        return undefined;
      }
      case 'email': {
        const val = (value as string).trim();
        if (!val) {
          return t('Email address is required', 'البريد الإلكتروني مطلوب');
        }
        if (!EMAIL_REGEX.test(val)) {
          return t('Please enter a valid email address (e.g. name@example.com)', 'يرجى إدخال بريد إلكتروني صحيح (مثال: name@example.com)');
        }
        return undefined;
      }
      case 'phone': {
        const val = (value as string).trim();
        if (!val) {
          return t('Phone number is required', 'رقم الجوال مطلوب');
        }
        if (!PHONE_REGEX.test(val.replace(/\s+/g, ''))) {
          return t(
            'Please enter a valid phone number (e.g. \u2066+966 50 123 4567\u2069)',
            'يرجى إدخال رقم جوال صحيح (مثال: \u2066+966 50 123 4567\u2069)'
          );
        }
        return undefined;
      }
      case 'password': {
        const val = value as string;
        if (!val) {
          return t('Password is required', 'كلمة المرور مطلوبة');
        }
        if (val.length < 8) {
          return t('Password must be at least 8 characters', 'يجب ألا تقل كلمة المرور عن 8 خانات');
        }
        return undefined;
      }
      case 'confirmPassword': {
        const val = value as string;
        if (!val) {
          return t('Please confirm your password', 'يرجى تأكيد كلمة المرور');
        }
        if (val !== currentForm.password) {
          return t('Passwords do not match', 'كلمتا المرور غير متطابقتين');
        }
        return undefined;
      }
      default:
        return undefined;
    }
  };

  const handleChange = (field: FormFieldKey, value: any) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);

    if (touched[field]) {
      const err = validateField(field, value, updatedForm);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }

    // When password changes, re-validate confirmPassword if it was touched
    if (field === 'password' && touched.confirmPassword) {
      const confirmErr = validateField('confirmPassword', form.confirmPassword, updatedForm);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
    }
  };

  const handleBlur = (field: FormFieldKey) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, form[field], form);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Mark all fields touched
    const allTouched: Partial<Record<FormFieldKey, boolean>> = {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    };
    setTouched(allTouched);

    // Validate all fields
    const newErrors: Partial<Record<FormFieldKey, string>> = {
      firstName: validateField('firstName', form.firstName, form),
      lastName: validateField('lastName', form.lastName, form),
      email: validateField('email', form.email, form),
      phone: validateField('phone', form.phone, form),
      password: validateField('password', form.password, form),
      confirmPassword: validateField('confirmPassword', form.confirmPassword, form),
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => Boolean(err));
    if (hasErrors) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await api.register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        marketingConsent: form.marketingConsent,
      });
      document.cookie = 'cosmetics_sid_hint=1; path=/';
      window.location.href = '/products';
    } catch (e) {
      setMessage((e as Error).message);
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/products');
    }
  };

  // Password matching status indicators
  const isPasswordLongEnough = form.password.length >= 8;
  const isPasswordMatching = form.confirmPassword.length > 0 && form.password === form.confirmPassword;

  return (
    <div className="mx-auto max-w-lg space-y-6 glass-card rounded-2xl p-8 border border-slate-200/40 animate-fade-in my-8 shadow-xl bg-white/95">
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

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="serif-font text-3xl font-bold text-slate-800">
          {t('Create Account', 'إنشاء حساب جديد')}
        </h1>
        <p className="text-xs uppercase tracking-widest text-amber-500 font-extrabold flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 inline" />
          {t('Half Link Energy & Security', 'هالف لينـك لأنظمة الطاقة وكاميرات المراقبة')}
        </p>
      </div>

      {/* Global / API Error Alert */}
      {message && (
        <div className="flex items-start gap-2.5 text-xs font-semibold text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">{t('Registration Failed', 'تعذر إنشاء الحساب')}</p>
            <p className="font-normal text-rose-600 mt-0.5">{message}</p>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={t('First Name', 'الاسم الأول')}
            value={form.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            placeholder={t('e.g. Fahad', 'مثال: فهد')}
            required
            isRequired
            error={touched.firstName ? errors.firstName : undefined}
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            className="bg-white/80"
            autoComplete="given-name"
          />
          <Input
            label={t('Last Name', 'اسم العائلة')}
            value={form.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            placeholder={t('e.g. Al-Otaibi', 'مثال: العتيبي')}
            required
            isRequired
            error={touched.lastName ? errors.lastName : undefined}
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            className="bg-white/80"
            autoComplete="family-name"
          />
        </div>

        {/* Email Field */}
        <Input
          label={t('Email Address', 'البريد الإلكتروني')}
          type="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="fahad@halflink.sa"
          required
          isRequired
          error={touched.email ? errors.email : undefined}
          leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          className="bg-white/80"
          autoComplete="email"
        />

        {/* Phone Field (Required) */}
        <Input
          label={t('Phone Number', 'رقم الجوال')}
          type="tel"
          value={form.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          onBlur={() => handleBlur('phone')}
          placeholder="050 000 0000 / +966 50 000 0000"
          required
          isRequired
          error={touched.phone ? errors.phone : undefined}
          leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
          className="bg-white/80 font-mono"
          autoComplete="tel"
        />

        {/* Password Field */}
        <Input
          label={t('Password', 'كلمة المرور')}
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={(e) => handleChange('password', e.target.value)}
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
          autoComplete="new-password"
        />

        {/* Confirm Password Field (NEW) */}
        <Input
          label={t('Confirm Password', 'تأكيد كلمة المرور')}
          type={showConfirmPassword ? 'text' : 'password'}
          value={form.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          onBlur={() => handleBlur('confirmPassword')}
          placeholder="••••••••"
          required
          isRequired
          error={touched.confirmPassword ? errors.confirmPassword : undefined}
          leftIcon={<ShieldCheck className="w-4 h-4 text-slate-400" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-slate-400 hover:text-slate-700 transition p-1 cursor-pointer"
              title={showConfirmPassword ? t('Hide password', 'إخفاء كلمة المرور') : t('Show password', 'إظهار كلمة المرور')}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          className="bg-white/80"
          autoComplete="new-password"
        />

        {/* Password Strength / Match Indicator Helper */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className={`w-3.5 h-3.5 transition-colors ${
                isPasswordLongEnough ? 'text-emerald-500' : 'text-slate-300'
              }`}
            />
            <span className={isPasswordLongEnough ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
              {t('At least 8 characters', '8 خانات أو أكثر')}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className={`w-3.5 h-3.5 transition-colors ${
                isPasswordMatching ? 'text-emerald-500' : 'text-slate-300'
              }`}
            />
            <span className={isPasswordMatching ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
              {t('Passwords match', 'كلمتا المرور متطابقتان')}
            </span>
          </div>
        </div>

        {/* Marketing Consent */}
        <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer pt-1 select-none">
          <input
            type="checkbox"
            checked={form.marketingConsent}
            onChange={(e) => handleChange('marketingConsent', e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
          />
          <span>
            {t(
              'Keep me updated with special offers, solar news, and security deals.',
              'أرغب في استلام العروض الحصرية، أخبار الطاقة وأنظمة المراقبة.'
            )}
          </span>
        </label>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-slate-950 hover:bg-amber-400 hover:text-slate-950 text-amber-400 border border-amber-500/30 font-bold transition shadow-md flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>{t('Creating Account...', 'جاري إنشاء الحساب...')}</span>
            </>
          ) : (
            t('Create Account', 'إنشاء الحساب')
          )}
        </Button>
      </form>

      {/* Footer Navigation to Login */}
      <div className="border-t border-slate-200/50 pt-4 text-center">
        <p className="text-xs text-slate-500">
          {t('Already registered?', 'لديك حساب بالفعل؟')}{' '}
          <Link href="/login" className="font-bold text-amber-600 hover:text-amber-700 hover:underline transition">
            {t('Sign in', 'تسجيل الدخول')}
          </Link>
        </p>
      </div>
    </div>
  );
}
