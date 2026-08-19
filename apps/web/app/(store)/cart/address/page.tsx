'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { UserProfile } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';
import { MapLocationPickerModal } from '@/components/store/map-location-picker-modal';
import { MapPin, Navigation, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function CartAddressPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const [country, setCountry] = useState('المملكة العربية السعودية');
  const [city, setCity] = useState('');
  const [addressInfo, setAddressInfo] = useState('');
  const [nationalId, setNationalId] = useState('');

  useEffect(() => {
    api
      .profile()
      .then((nextProfile) => {
        setProfile(nextProfile);
        if (nextProfile.defaultAddress) {
          setCountry(nextProfile.defaultAddress.country || 'المملكة العربية السعودية');
          setCity(nextProfile.defaultAddress.city || '');
          setAddressInfo(nextProfile.defaultAddress.line1 || '');
        }
        if (nextProfile.nationalId) {
          setNationalId(nextProfile.nationalId);
        }
      })
      .catch((e: Error) => toast.error(e.message));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;

    if (!nationalId.trim() || nationalId.replace(/\D/g, '').length < 10) {
      toast.error(t('Please enter a valid 10-digit National ID / Iqama number', 'يرجى إدخال رقم هوية وطنية أو إقامة صحيح (10 أرقام)'));
      return;
    }
    if (!country.trim()) {
      toast.error(t('Please specify the Country', 'يرجى تحديد الدولة'));
      return;
    }
    if (!city.trim()) {
      toast.error(t('Please specify the City', 'يرجى إدخال المدينة'));
      return;
    }
    if (!addressInfo.trim()) {
      toast.error(t('Please provide the Address Info', 'يرجى إدخال تفاصيل العنوان'));
      return;
    }

    setSaving(true);

    try {
      await api.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        nationalId: nationalId.trim(),
        marketingConsent: profile.marketingConsent,
        address: {
          line1: addressInfo.trim(),
          city: city.trim(),
          country: country.trim(),
          postalCode: '00000',
        },
      });
      toast.success(t('Delivery address saved successfully!', 'تم حفظ عنوان التوصيل بنجاح!'));
      router.push('/cart');
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Toaster position="top-right" richColors />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500"></div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
          {t('Loading Address Form...', 'جاري تحميل العنوان...')}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in pb-16">
      <Toaster position="top-right" richColors />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="serif-font text-2xl sm:text-3xl font-black text-slate-900">
            {t('Delivery Address & National ID', 'عنوان التوصيل والهوية الوطنية')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('Specify your 3 location fields and National ID for order delivery.', 'حدد بيانات الموقع الثلاثة ورقم الهوية الوطنية لشحن وتوصيل الطلبات.')}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/cart')}
          className="border-slate-200 text-xs flex items-center gap-1.5 font-bold"
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          {t('Back to Cart', 'العودة إلى السلة')}
        </Button>
      </div>

      <form onSubmit={submit} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/70 bg-white shadow-sm space-y-5">
        {/* National ID Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            {t('National ID / Iqama Number *', 'رقم الهوية الوطنية / الإقامة *')}
          </label>
          <Input
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value.replace(/\D/g, '').substring(0, 10))}
            placeholder="10XXXXXXXX / 20XXXXXXXX (10 digits)"
            maxLength={10}
            required
          />
          <p className="text-[10px] text-slate-400">
            {t('Mandatory for courier verification and Saudi logistics compliance.', 'إلزامي للتحقق من هوية المستلم ومطابقة أنظمة النقل واللوجستيات.')}
          </p>
        </div>

        {/* The 3 Location Fields */}
        <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {t('1. Country *', '1. الدولة *')}
            </label>
            <Input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="المملكة العربية السعودية"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {t('2. City *', '2. المدينة *')}
            </label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="الرياض / جدة / الدمام..."
              required
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                {t('3. Address Info (District, Street, Building) *', '3. تفاصيل العنوان (الحي، الشارع، المبنى) *')}
              </label>

              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="text-[10px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1 transition shadow-2xs"
              >
                <Navigation className="w-3 h-3 text-amber-600 animate-pulse" />
                <span>{t('📍 Pin on Map (GPS)', '📍 تحديد من الخريطة')}</span>
              </button>
            </div>

            <textarea
              required
              rows={3}
              value={addressInfo}
              onChange={(e) => setAddressInfo(e.target.value)}
              placeholder={t('e.g. Al-Narjis District, Othman Bin Affan St, Villa 12', 'مثال: حي النرجس، شارع عثمان بن عفان، فيلا 12')}
              className="w-full text-xs font-medium px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50 leading-relaxed resize-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('Saved securely to your account', 'محفوظ بأمان في ملفك الشخصي')}</span>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => router.push('/cart')} disabled={saving} className="text-xs">
              {t('Cancel', 'إلغاء')}
            </Button>
            <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-6">
              {saving ? t('Saving...', 'جاري الحفظ...') : t('Save & Continue', 'حفظ ومتابعة')}
            </Button>
          </div>
        </div>
      </form>

      {/* Map Location Picker Modal */}
      <MapLocationPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelectLocation={(loc) => {
          setCountry(loc.country);
          setCity(loc.city);
          setAddressInfo(loc.addressInfo);
        }}
      />
    </div>
  );
}
