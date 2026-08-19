'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, X, Check, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';
import { toast } from 'sonner';

interface MapLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (data: { country: string; city: string; addressInfo: string }) => void;
}

export const MapLocationPickerModal: React.FC<MapLocationPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
}) => {
  const { t } = useLanguage();
  const [locating, setLocating] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: 24.7136, // Riyadh default
    lng: 46.6753,
  });
  const [resolvedAddress, setResolvedAddress] = useState<string>('الرياض، المملكة العربية السعودية');
  const [detectedCity, setDetectedCity] = useState<string>('الرياض');

  const popularCities = [
    { nameAr: 'الرياض (Riyadh)', lat: 24.7136, lng: 46.6753, city: 'الرياض' },
    { nameAr: 'جدة (Jeddah)', lat: 21.5433, lng: 39.1728, city: 'جدة' },
    { nameAr: 'الدمام (Dammam)', lat: 26.4207, lng: 50.0888, city: 'الدمام' },
    { nameAr: 'مكة المكرمة (Mecca)', lat: 21.3891, lng: 39.8579, city: 'مكة المكرمة' },
    { nameAr: 'المدينة المنورة (Medina)', lat: 24.5247, lng: 39.5692, city: 'المدينة المنورة' },
    { nameAr: 'الخبر (Khobar)', lat: 26.2172, lng: 50.1971, city: 'الخبر' },
  ];

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar,en`
      );
      if (res.ok) {
        const data = await res.json();
        const display = data.display_name || '';
        const city =
          data.address?.city ||
          data.address?.town ||
          data.address?.state ||
          data.address?.county ||
          'الرياض';
        setDetectedCity(city);
        setResolvedAddress(display.split(',').slice(0, 3).join(', '));
      }
    } catch {
      // Fallback
      setResolvedAddress(`موقع محدد (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('Geolocation is not supported by your browser', 'خاصية تحديد الموقع غير مدعومة في متصفحك'));
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setSelectedCoords({ lat, lng });
        await reverseGeocode(lat, lng);
        setLocating(false);
        toast.success(t('Location detected successfully!', 'تم تحديد موقعك الحالي بنجاح!'));
      },
      (err) => {
        setLocating(false);
        toast.error(t('Could not retrieve GPS location. Please select on map.', 'تعذر الوصول للموقع الجغرافي. يرجى الاختيار من الخريطة.'));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSelectCityPreset = async (preset: (typeof popularCities)[0]) => {
    setSelectedCoords({ lat: preset.lat, lng: preset.lng });
    setDetectedCity(preset.city);
    await reverseGeocode(preset.lat, preset.lng);
  };

  const handleConfirm = () => {
    onSelectLocation({
      country: 'المملكة العربية السعودية (Saudi Arabia)',
      city: detectedCity,
      addressInfo: resolvedAddress,
    });
    toast.success(t('Address filled from map pin!', 'تم تعبئة تفاصيل العنوان من الخريطة!'));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  {t('Pin Location on Map', 'تحديد موقع التوصيل على الخريطة')}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {t('Accurate delivery pin for courier dispatch', 'لتوصيل شحنتك بدقة وسرعة')}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick City Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              {t('Select City / Region', 'اختر المدينة أو المنطقة')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {popularCities.map((c) => (
                <button
                  key={c.nameAr}
                  type="button"
                  onClick={() => handleSelectCityPreset(c)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                    detectedCity === c.city
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.nameAr}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive OpenStreetMap Container */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner h-56 bg-slate-100">
            <iframe
              title="Location Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedCoords.lng - 0.05}%2C${
                selectedCoords.lat - 0.05
              }%2C${selectedCoords.lng + 0.05}%2C${selectedCoords.lat + 0.05}&layer=mapnik&marker=${
                selectedCoords.lat
              }%2C${selectedCoords.lng}`}
              className="w-full h-full"
            />

            {/* GPS Button overlay */}
            <div className="absolute top-3 right-3 z-10">
              <Button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locating}
                className="bg-slate-950 text-white hover:bg-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5"
              >
                {locating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{locating ? t('Locating...', 'جاري التحديد...') : t('Use My GPS', 'موقعي الحالي (GPS)')}</span>
              </Button>
            </div>
          </div>

          {/* Resolved Address Preview Box */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1">
            <span className="font-bold text-amber-900 block text-[11px]">
              {t('Selected Address Information:', 'تفاصيل العنوان المحدد:')}
            </span>
            <p className="text-slate-800 font-medium leading-relaxed">{resolvedAddress}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="w-1/3 py-2.5 text-xs border-slate-200"
            >
              {t('Cancel', 'إلغاء')}
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{t('Apply to Address Info', 'اعتماد وتعبئة تفاصيل العنوان')}</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
