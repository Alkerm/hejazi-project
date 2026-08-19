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
  Trash2,
  AlertTriangle,
  X,
  Building,
  Navigation,
  Compass,
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/language-context';
import { MapLocationPickerModal } from '@/components/store/map-location-picker-modal';

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
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }>({});

  // Saudi National Address Structured State
  const [buildingNumber, setBuildingNumber] = useState('');
  const [street, setStreet] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('الرياض');
  const [postalCode, setPostalCode] = useState('13326');
  const [secondaryNumber, setSecondaryNumber] = useState('');
  const [shortAddress, setShortAddress] = useState('');
  const [country, setCountry] = useState('المملكة العربية السعودية');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    api
      .profile()
      .then((nextProfile) => {
        setProfile(nextProfile);
        setInitialProfile(nextProfile);

        if (nextProfile.defaultAddress) {
          const addr = nextProfile.defaultAddress;
          setCity(addr.city || 'الرياض');
          setCountry(addr.country || 'المملكة العربية السعودية');
          setPostalCode(addr.postalCode && addr.postalCode !== '00000' ? addr.postalCode : '13326');

          const line1 = addr.line1 || '';
          const line2 = addr.line2 || '';

          // Parse or fallback into fields
          if (line1) {
            const parts = line1.split('،').map((p) => p.trim());
            if (parts.length >= 2) {
              setStreet(parts[0] || '');
              setDistrict(parts[1] || '');
            } else {
              setStreet(line1);
            }
          }

          if (line2) {
            setShortAddress(line2.replace(/^(العنوان المختصر:|Short Address:)\s*/i, '').trim());
          }
        }
      })
      .catch((e: Error) => {
        toast.error(e.message || t('Please log in to view your profile', 'يرجى تسجيل الدخول لعرض حسابك'));
        router.push('/login');
      });
  }, [router, t]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;

    // Reset previous errors
    const errors: typeof fieldErrors = {};

    // 1. Validate First Name
    if (!profile.firstName || !profile.firstName.trim()) {
      errors.firstName = t('First name is required and cannot be empty', 'الاسم الأول إلزامي ولا يمكن تركه فارغاً');
    }

    // 2. Validate Last Name
    if (!profile.lastName || !profile.lastName.trim()) {
      errors.lastName = t('Last name is required and cannot be empty', 'اسم العائلة إلزامي ولا يمكن تركه فارغاً');
    }

    // 3. Validate Phone
    const cleanPhone = (profile.phone || '').replace(/\D/g, '');
    if (!profile.phone || !profile.phone.trim() || cleanPhone.length < 8) {
      errors.phone = t('Please enter a valid phone number (e.g. +966 50 000 0000)', 'يرجى إدخال رقم جوال صحيح (مثال: +966 50 000 0000)');
    }

    // 4. Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profile.email || !profile.email.trim() || !emailRegex.test(profile.email.trim())) {
      errors.email = t('Please enter a valid email address', 'يرجى إدخال بريد إلكتروني صحيح');
    }

    // 5. Validate Password if changing
    if (newPassword && !currentPassword) {
      errors.currentPassword = t('Current password is required to set a new password', 'يرجى إدخال كلمة المرور الحالية لتغيير كلمة المرور');
    }
    if (newPassword && newPassword.length < 8) {
      errors.newPassword = t('New password must be at least 8 characters', 'يجب ألا تقل كلمة المرور الجديدة عن 8 خانات');
    }

    // If there are errors in details, switch tab and block submit
    if (errors.firstName || errors.lastName || errors.phone || errors.email) {
      setFieldErrors(errors);
      setActiveTab('DETAILS');
      const firstError = errors.firstName || errors.lastName || errors.phone || errors.email;
      toast.error(firstError);
      return;
    }

    if (errors.currentPassword || errors.newPassword) {
      setFieldErrors(errors);
      setActiveTab('SECURITY');
      toast.error(errors.currentPassword || errors.newPassword);
      return;
    }

    setFieldErrors({});
    setSaving(true);
    setSuccessMessage(null);

    const emailChanged = initialProfile ? profile.email.trim() !== initialProfile.email : false;

    // Compose formatted Saudi National Address line
    const formattedLine1 = [
      buildingNumber ? `${t('Bldg', 'مبنى')} ${buildingNumber.trim()}` : '',
      street ? street.trim() : '',
      district ? `${t('Dist.', 'حي')} ${district.trim()}` : '',
    ]
      .filter(Boolean)
      .join('، ');

    const composedLine2 = [
      shortAddress ? shortAddress.toUpperCase().trim() : '',
      secondaryNumber ? `${t('Sec #', 'الرقم الإضافي:')} ${secondaryNumber.trim()}` : '',
    ]
      .filter(Boolean)
      .join(' - ');

    const payloadAddress = {
      line1: formattedLine1 || street || profile.defaultAddress?.line1 || `${t('Bldg 2938, Al-Wadi Dist.', 'مبنى 2938، حي الوادي')}`,
      line2: composedLine2 || profile.defaultAddress?.line2 || null,
      city: city.trim() || 'الرياض',
      country: country.trim() || 'المملكة العربية السعودية',
      postalCode: postalCode.trim() || '13326',
    };

    try {
      const next = await api.updateProfile({
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        email: emailChanged ? profile.email.trim() : undefined,
        phone: profile.phone?.trim(),
        marketingConsent: profile.marketingConsent,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
        address: payloadAddress,
      });

      setProfile(next);
      setInitialProfile(next);
      const msg = t('Your Saudi National Address & profile have been saved successfully!', 'تم حفظ العنوان الوطني وبيانات الملف الشخصي بنجاح!');
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

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await api.deleteAccount();
      document.cookie = 'cosmetics_sid_hint=; Max-Age=0; path=/';
      toast.success(t('Account deleted successfully', 'تم حذف الحساب ومسح البيانات بنجاح'));
      setShowDeleteModal(false);
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDeletingAccount(false);
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
            className="bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white text-xs font-bold flex items-center gap-1.5 rounded-xl px-4 py-2.5 shadow-2xs hover:shadow-md transition-all flex-none border-0 cursor-pointer"
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
                ? 'border-emerald-600 text-emerald-700 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>{t('Saudi National Address 🇸🇦', 'العنوان الوطني السعودي 🇸🇦')}</span>
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

          {/* TAB 1: DETAILS */}
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
                  onChange={(e) => {
                    setProfile({ ...profile, firstName: e.target.value });
                    if (fieldErrors.firstName && e.target.value.trim()) {
                      setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                    }
                  }}
                  placeholder={t('First name', 'الاسم الأول')}
                  required
                  isRequired
                  error={fieldErrors.firstName}
                />
                <Input
                  label={t('Last Name', 'اسم العائلة')}
                  value={profile.lastName}
                  onChange={(e) => {
                    setProfile({ ...profile, lastName: e.target.value });
                    if (fieldErrors.lastName && e.target.value.trim()) {
                      setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                    }
                  }}
                  placeholder={t('Last name', 'اسم العائلة')}
                  required
                  isRequired
                  error={fieldErrors.lastName}
                />
                <Input
                  label={t('Phone Number', 'رقم الجوال')}
                  value={profile.phone ?? ''}
                  onChange={(e) => {
                    setProfile({ ...profile, phone: e.target.value });
                    if (fieldErrors.phone && e.target.value.trim()) {
                      setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                    }
                  }}
                  placeholder="+966 50 000 0000"
                  required
                  isRequired
                  error={fieldErrors.phone}
                />
                <Input
                  label={t('Email Address', 'البريد الإلكتروني')}
                  type="email"
                  value={profile.email}
                  onChange={(e) => {
                    setProfile({ ...profile, email: e.target.value });
                    if (fieldErrors.email && e.target.value.trim()) {
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder="name@example.com"
                  required
                  isRequired
                  error={fieldErrors.email}
                />
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
                      'I consent to receive promotional offers, solar & security news, and setup guides from Half Link.',
                      'أوافق على استلام العروض الحصرية وأخبار أنظمة الطاقة والمراقبة من متجر هالف لينك.'
                    )}
                  </span>
                </label>
              )}
            </div>
          )}

          {/* TAB 2: SAUDI NATIONAL ADDRESS (SPL COMPLIANT) */}
          {activeTab === 'ADDRESS' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header with GPS Map Pin button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-black tracking-wider uppercase">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t('SPL National Address Standard', 'المعيار الرسمي للعنوان الوطني (سبل)')}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    {t('Saudi National Address & Logistics Delivery', 'العنوان الوطني السعودي والتوصيل اللوجستي')}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {t(
                      'Complete your official National Address fields to ensure seamless courier dispatch across the Kingdom.',
                      'املأ حقول العنوان الوطني المعتمد لتسليم الطلبات وكاميرات المراقبة وأنظمة الطاقة بأعلى دقة وسرعة.'
                    )}
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-2xs self-start sm:self-center cursor-pointer shrink-0"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                  <span>{t('📍 Pin on Map (GPS)', '📍 تحديد من الخريطة')}</span>
                </Button>
              </div>

              {/* National Address Live Preview Card (SPL Official Style) */}
              <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/30 p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      🇸🇦
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider block">
                        {t('Saudi Post (SPL) Certified National Address', 'بطاقة العنوان الوطني السعودي المعتمد')}
                      </span>
                      <p className="text-xs font-bold text-slate-800">
                        {buildingNumber ? `${t('Building', 'مبنى')} ${buildingNumber}، ` : ''}
                        {street ? `${street}، ` : ''}
                        {district ? `${t('Dist.', 'حي')} ${district}، ` : ''}
                        {city || 'الرياض'}
                      </p>
                    </div>
                  </div>

                  {shortAddress && (
                    <div className="bg-emerald-700 text-white font-mono text-xs font-black px-3 py-1 rounded-lg tracking-widest shadow-2xs">
                      {shortAddress.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-100 text-[11px]">
                  <div className="bg-white/80 p-2 rounded-lg border border-emerald-100/60">
                    <span className="text-slate-400 block text-[9px] font-bold uppercase">{t('Postal Code', 'الرمز البريدي')}</span>
                    <span className="font-mono font-bold text-slate-800">{postalCode || '13326'}</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-emerald-100/60">
                    <span className="text-slate-400 block text-[9px] font-bold uppercase">{t('Secondary No.', 'الرقم الإضافي')}</span>
                    <span className="font-mono font-bold text-slate-800">{secondaryNumber || '—'}</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-emerald-100/60">
                    <span className="text-slate-400 block text-[9px] font-bold uppercase">{t('Building No.', 'رقم المبنى')}</span>
                    <span className="font-mono font-bold text-slate-800">{buildingNumber || '—'}</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-emerald-100/60">
                    <span className="text-slate-400 block text-[9px] font-bold uppercase">{t('Short Address', 'العنوان المختصر')}</span>
                    <span className="font-mono font-bold text-slate-800">{shortAddress || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Structured Address Form Inputs */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* 1. National Short Address Code */}
                <div className="space-y-1 sm:col-span-2">
                  <Input
                    label={t('National Short Address Code (4 Letters + 4 Digits)', 'رمز العنوان الوطني المختصر (4 أحرف + 4 أرقام)')}
                    value={shortAddress}
                    onChange={(e) => setShortAddress(e.target.value.toUpperCase())}
                    placeholder="مثال: RNAD2938 / RRRD1234"
                    maxLength={10}
                    leftIcon={<QrCode className="w-4 h-4 text-emerald-600" />}
                    className="font-mono uppercase font-bold tracking-wider bg-white"
                  />
                  <p className="text-[10px] text-slate-400">
                    {t('The 8-character official short address issued by SPL Saudi Post.', 'العنوان المختصر المكون من 8 خانات الصادر من تطبيق البريد السعودي (سبل) أو توكلنا.')}
                  </p>
                </div>

                {/* 2. Building Number */}
                <Input
                  label={t('Building Number (4 Digits) *', 'رقم المبنى (4 أرقام) *')}
                  value={buildingNumber}
                  onChange={(e) => setBuildingNumber(e.target.value.replace(/\D/g, '').substring(0, 5))}
                  placeholder="مثال: 2938 أو 7412"
                  maxLength={5}
                  leftIcon={<Building className="w-4 h-4 text-slate-400" />}
                  className="font-mono"
                  required
                />

                {/* 3. Secondary / Additional Number */}
                <Input
                  label={t('Secondary / Additional Number (4 Digits)', 'الرقم الإضافي (4 أرقام)')}
                  value={secondaryNumber}
                  onChange={(e) => setSecondaryNumber(e.target.value.replace(/\D/g, '').substring(0, 5))}
                  placeholder="مثال: 4122"
                  maxLength={5}
                  leftIcon={<Compass className="w-4 h-4 text-slate-400" />}
                  className="font-mono"
                />

                {/* 4. Street Name */}
                <Input
                  label={t('Street Name *', 'اسم الشارع *')}
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="مثال: شارع عثمان بن عفان / طريق الملك عبدالعزيز"
                  required
                />

                {/* 5. District */}
                <Input
                  label={t('District Name *', 'اسم الحي *')}
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="مثال: حي الوادي / حي النرجس / حي الياسمين"
                  required
                />

                {/* 6. City */}
                <Input
                  label={t('City *', 'المدينة *')}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="الرياض / جدة / مكة / الدمام..."
                  required
                />

                {/* 7. Postal Code */}
                <Input
                  label={t('Postal Code (5 Digits) *', 'الرمز البريدي (5 أرقام) *')}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').substring(0, 5))}
                  placeholder="13326"
                  maxLength={5}
                  className="font-mono"
                  required
                />
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY */}
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
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (fieldErrors.currentPassword) {
                      setFieldErrors((prev) => ({ ...prev, currentPassword: undefined }));
                    }
                  }}
                  error={fieldErrors.currentPassword}
                  placeholder="••••••••"
                />
                <Input
                  label={t('New Password', 'كلمة المرور الجديدة')}
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (fieldErrors.newPassword) {
                      setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
                    }
                  }}
                  error={fieldErrors.newPassword}
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
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-md shadow-amber-500/20 cursor-pointer"
            >
              {saving ? t('Saving Changes...', 'جاري الحفظ...') : t('Save Changes', 'حفظ التغييرات')}
            </Button>
          </div>
        </form>
      </div>

      {/* PDPL Privacy & Account Deletion (Danger Zone) Card */}
      <div className="rounded-3xl border border-rose-200/80 bg-rose-50/40 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-600 shrink-0" />
              <h2 className="text-sm font-bold text-rose-900">
                {t('Personal Data Protection & Account Deletion (PDPL)', 'حماية البيانات الشخصية وحذف الحساب (سدايا PDPL)')}
              </h2>
            </div>
            <p className="text-xs text-rose-700/90 leading-relaxed font-normal">
              {t(
                'In compliance with the Saudi Personal Data Protection Law (PDPL), you have the full right to permanently delete your account and remove your personal data.',
                'تطبيقاً لنظام حماية البيانات الشخصية الصادر عن (سدايا PDPL)، يحق لك في أي وقت حذف حسابك ومسح كافة بياناتك الشخصية المسجلة نهائياً.'
              )}
            </p>
          </div>

          <Button
            type="button"
            onClick={() => {
              setDeleteConfirmText('');
              setShowDeleteModal(true);
            }}
            className="bg-white hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-2xs hover:shadow-md flex items-center gap-2 self-start sm:self-center shrink-0 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('Delete Account', 'حذف الحساب نهائياً')}</span>
          </Button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-200 space-y-5 animate-scale-in">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                {t('Are you sure you want to delete your account?', 'هل أنت متأكد من رغبتك في حذف حسابك؟')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t(
                  'This action is irreversible. Your profile, delivery addresses, wishlist, and active cart will be permanently deleted.',
                  'هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم مسح بياناتك الشخصية، العناوين المسجلة، والمفضلة بالكامل من النظام.'
                )}
              </p>
            </div>

            <div className="bg-rose-50 border border-rose-200/70 rounded-xl p-3 text-xs text-rose-800 space-y-1">
              <p className="font-semibold">{t('Please note:', 'تنبيه هام:')}</p>
              <p className="text-[11px] text-rose-700 leading-normal">
                {t(
                  'If you have in-progress orders, account deletion will be prevented until orders are delivered.',
                  'إذا كانت لديك شحنات قيد التوصيل، لا يمكن حذف الحساب حتى يتم استلام الطلب أو إلغاؤه.'
                )}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                {t('Type DELETE to confirm:', 'اكتب كلمة (حذف) أو (DELETE) للتأكيد:')}
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={lang === 'ar' ? 'حذف' : 'DELETE'}
                className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border-0 cursor-pointer"
              >
                {t('Cancel', 'إلغاء')}
              </Button>
              <Button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount || (deleteConfirmText !== 'DELETE' && deleteConfirmText !== 'حذف')}
                className="bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl border-0 shadow-md shadow-rose-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                {deletingAccount ? t('Deleting...', 'جاري الحذف...') : t('Permanently Delete', 'تأكيد الحذف النهائي')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Map Location Picker Modal */}
      <MapLocationPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelectLocation={(loc) => {
          setCity(loc.city);
          setCountry(loc.country || 'المملكة العربية السعودية');
          if (loc.addressInfo) {
            setStreet(loc.addressInfo);
          }
        }}
      />
    </div>
  );
}
