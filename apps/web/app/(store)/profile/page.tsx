'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Package,
  Heart,
  MapPin,
  Shield,
  LogOut,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/language-context';

export default function ProfilePage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initialProfile, setInitialProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'SECURITY' | 'ADDRESS'>('DETAILS');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    api
      .profile()
      .then((nextProfile) => {
        setProfile(nextProfile);
        setInitialProfile(nextProfile);
      })
      .catch((e: Error) => {
        toast.error(e.message || t('Please log in to view your profile', 'يرجى تسجيل الدخول لعرض حسابك'));
        router.push('/login');
      });
  }, [router, t]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setSuccessMessage(null);

    const emailChanged = initialProfile ? profile.email !== initialProfile.email : false;

    try {
      const next = await api.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: emailChanged ? profile.email : undefined,
        phone: profile.phone,
        marketingConsent: profile.marketingConsent,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
        address: profile.defaultAddress ?? undefined,
      });
      setProfile(next);
      setInitialProfile(next);
      const msg = t('Your profile information has been saved successfully!', 'تم حفظ وتحديث بيانات ملفك الشخصي بنجاح!');
      setSuccessMessage(msg);
      toast.success(msg);
      setCurrentPassword('');
      setNewPassword('');

      // Auto-hide the success banner after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    setLoggingOut(true);

    try {
      await api.logout();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      document.cookie = 'cosmetics_sid_hint=; Max-Age=0; path=/';
      router.push('/');
      router.refresh();
      setLoggingOut(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Toaster position="top-right" richColors />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500"></div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
          {t('Loading profile', 'جاري تحميل الحساب')}
        </p>
      </div>
    );
  }

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      <Toaster position="top-right" richColors />

      {/* Market-Standard User Profile Banner Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-sm relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-amber-50/25">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar Circle */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-950 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl sm:text-3xl font-mono font-extrabold shadow-md border-4 border-white flex-none">
            {initials}
          </div>

          {/* User Meta Info */}
          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="serif-font text-2xl sm:text-3xl font-bold text-slate-800">
                {profile.firstName} {profile.lastName}
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 font-medium pt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {profile.email}
              </span>
              {profile.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {profile.phone}
                </span>
              )}
            </div>
          </div>

          {/* Logout Action Button */}
          <Button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold flex items-center gap-1.5 rounded-xl px-4 py-2.5 shadow-2xs hover:shadow-md transition-all flex-none border-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-white" />
            {loggingOut ? t('Logging out...', 'جاري الخروج...') : t('Log Out', 'تسجيل الخروج')}
          </Button>
        </div>
      </div>

      {/* Quick Action Navigation Grid (Market Standard Hub) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/orders"
          className="glass-card rounded-2xl p-5 border border-slate-200/60 hover:shadow-md hover:border-amber-300 transition-all flex items-center justify-between group bg-white"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-slate-950 text-amber-400 border border-amber-500/30 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">{t('Orders & Deliveries', 'طلباتي والشحنات')}</h3>
              <p className="text-xs text-slate-500 font-medium">{t('Track status & history', 'متابعة شحناتك الحالية')}</p>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform ${lang === 'ar' ? 'rotate-180' : ''}`} />
        </Link>

        <Link
          href="/wishlist"
          className="glass-card rounded-2xl p-5 border border-slate-200/60 hover:shadow-md hover:border-rose-200 transition-all flex items-center justify-between group bg-white"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">{t('Saved Wishlist', 'المفضلة والمحفوظات')}</h3>
              <p className="text-xs text-slate-500 font-medium">{t('View saved items', 'عرض المنتجات المفضلة')}</p>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform ${lang === 'ar' ? 'rotate-180' : ''}`} />
        </Link>
      </div>

      {/* Account Settings Management Card */}
      <div className="glass-card rounded-3xl border border-slate-200/60 bg-white overflow-hidden shadow-sm">
        {/* Navigation Tabs Header */}
        <div className="flex border-b border-slate-200/80 px-6 pt-4 bg-slate-50/50 gap-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('DETAILS')}
            className={`pb-4 text-xs font-extrabold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'DETAILS'
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <User className="w-4 h-4" />
            {t('Personal Details', 'البيانات الشخصية')}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ADDRESS')}
            className={`pb-4 text-xs font-extrabold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'ADDRESS'
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <MapPin className="w-4 h-4" />
            {t('Shipping Address', 'عنوان التوصيل')}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SECURITY')}
            className={`pb-4 text-xs font-extrabold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'SECURITY'
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Lock className="w-4 h-4" />
            {t('Security & Password', 'الأمان وكلمة المرور')}
          </button>
        </div>

        {/* Tab Form Body */}
        <form onSubmit={submit} className="p-6 sm:p-8 space-y-6">
          {successMessage && (
            <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 animate-fade-in shadow-2xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-none" />
                <span className="text-xs font-bold">{successMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 uppercase"
              >
                ✕
              </button>
            </div>
          )}

          {activeTab === 'DETAILS' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">{t('Personal Details', 'البيانات الشخصية')}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t('Manage your personal contact information for your orders and invoices.', 'إدارة بيانات الاتصال والمعلومات الأساسية.')}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={t('First Name', 'الاسم الأول')}
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                />
                <Input
                  label={t('Last Name', 'اسم العائلة')}
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                />
                <Input
                  label={t('Phone Number', 'رقم الجوال')}
                  value={profile.phone ?? ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+966 50 000 0000"
                />
                <Input
                  label={t('Email Address', 'البريد الإلكتروني')}
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
                <div className="sm:col-span-2">
                  <Input
                    label={t('National ID / Iqama Number', 'رقم الهوية الوطنية / الإقامة')}
                    value={profile.nationalId ?? ''}
                    onChange={(e) => setProfile({ ...profile, nationalId: e.target.value.replace(/\D/g, '').substring(0, 10) })}
                    placeholder="10XXXXXXXX / 20XXXXXXXX (10 digits)"
                    maxLength={10}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {t('Used for order verification and Saudi courier delivery compliance.', 'يستخدم للتحقق ومطابقة أنظمة الشحن والتوصيل بالمملكة.')}
                  </p>
                </div>
              </div>

              {profile.role === 'USER' && (
                <label className="flex items-start gap-3 text-xs font-semibold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.marketingConsent}
                    onChange={(e) => setProfile({ ...profile, marketingConsent: e.target.checked })}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                  />
                  <span>
                    {t(
                      'I consent to receive exclusive promotional offers, news, and setup guides from Hejazi Cosmetics.',
                      'أوافق على استلام العروض الحصرية والأخبار ونشرات الخصومات من متجر حجازي.'
                    )}
                  </span>
                </label>
              )}
            </div>
          )}

          {activeTab === 'ADDRESS' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">{t('Default Delivery Address', 'عنوان التوصيل الرئيسي')}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t('Specify your 3 location fields for dispatching orders across Saudi Arabia.', 'حدد بيانات الموقع الثلاثة لشحن وتوصيل طلباتك داخل المملكة.')}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={t('1. Country', '1. الدولة')}
                  value={profile.defaultAddress?.country ?? 'المملكة العربية السعودية'}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      defaultAddress: {
                        line1: profile.defaultAddress?.line1 ?? '',
                        line2: profile.defaultAddress?.line2 ?? null,
                        city: profile.defaultAddress?.city ?? '',
                        country: e.target.value,
                        postalCode: profile.defaultAddress?.postalCode ?? '00000',
                      },
                    })
                  }
                  placeholder="المملكة العربية السعودية / Saudi Arabia"
                />

                <Input
                  label={t('2. City', '2. المدينة')}
                  value={profile.defaultAddress?.city ?? ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      defaultAddress: {
                        line1: profile.defaultAddress?.line1 ?? '',
                        line2: profile.defaultAddress?.line2 ?? null,
                        city: e.target.value,
                        country: profile.defaultAddress?.country ?? 'المملكة العربية السعودية',
                        postalCode: profile.defaultAddress?.postalCode ?? '00000',
                      },
                    })
                  }
                  placeholder="الرياض، جدة، الدمام... / Riyadh, Jeddah..."
                />

                <div className="sm:col-span-2">
                  <Input
                    label={t('3. Address Info (District, Street, Building)', '3. تفاصيل العنوان (اسم الحي، الشارع، رقم المبنى)')}
                    value={profile.defaultAddress?.line1 ?? ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        defaultAddress: {
                          line1: e.target.value,
                          line2: profile.defaultAddress?.line2 ?? null,
                          city: profile.defaultAddress?.city ?? '',
                          country: profile.defaultAddress?.country ?? 'المملكة العربية السعودية',
                          postalCode: profile.defaultAddress?.postalCode ?? '00000',
                        },
                      })
                    }
                    placeholder="مثال: حي النرجس، شارع عثمان بن عفان، فيلا 12"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'SECURITY' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">{t('Security & Password Overrides', 'الأمان وكلمة المرور')}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t('To update your password or sensitive email info, provide your current password.', 'لتعديل كلمة المرور أو البريد الإلكتروني، يرجى إدخال كلمة المرور الحالية.')}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={t('Current Password', 'كلمة المرور الحالية')}
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <Input
                  label={t('New Password', 'كلمة المرور الجديدة')}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('Leave blank to keep current', 'اتركه فارغاً للإبقاء على الحالية')}
                />
              </div>
            </div>
          )}

          {/* Form Save Button Footer */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-md shadow-amber-500/20"
            >
              {saving ? t('Saving Changes...', 'جاري الحفظ...') : t('Save Changes', 'حفظ التغييرات')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
