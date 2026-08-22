'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Banknote, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export type PaymentMethod = 'MADA' | 'APPLE_PAY' | 'STC_PAY' | 'CREDIT_CARD' | 'AMEX' | 'SAMSUNG_PAY' | 'COD';

interface PaymentSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({ selectedMethod, onSelectMethod }) => {
  const { t } = useLanguage();
  const [isAppleDevice, setIsAppleDevice] = useState(false);
  const [isSamsungDevice, setIsSamsungDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = navigator.userAgent || '';

    // Detect iPhone, iPad, or Mac Safari with Apple Pay support
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isMacSafari = /Macintosh/i.test(ua) && /Safari/i.test(ua) && !/Chrome|Chromium|Edg|OPR/i.test(ua);
    const hasApplePay = Boolean((window as any).ApplePaySession);
    const appleSupported = isIOS || (isMacSafari && hasApplePay);
    setIsAppleDevice(appleSupported);

    // Detect Samsung Galaxy devices / Samsung Browser (excluding iPhone / Desktop)
    const samsungSupported = !appleSupported && /SamsungBrowser|SAMSUNG|SM-[A-Z0-9]+/i.test(ua);
    setIsSamsungDevice(samsungSupported);

    // If current selectedMethod is not supported on this device, fallback to MADA
    if (selectedMethod === 'APPLE_PAY' && !appleSupported) {
      onSelectMethod('MADA');
    } else if (selectedMethod === 'SAMSUNG_PAY' && !samsungSupported) {
      onSelectMethod('MADA');
    }
  }, []);

  const rawOptions: { id: PaymentMethod; label: string; icon: React.ReactNode; description: string; badge?: string }[] = [
    {
      id: 'MADA',
      label: t('Mada Debit Card (مدى)', 'بطاقة مدى (Mada)'),
      icon: <div className="w-5 h-5 rounded-md bg-emerald-600 text-white font-black text-[9px] flex items-center justify-center">مدى</div>,
      description: t('Instant payment with any Saudi bank Mada card.', 'الدفع الفوري ببطاقات مدى من كافة البنوك السعودية.'),
      badge: t('Popular in KSA', 'الأكثر استخداماً بالمملكة'),
    },
    {
      id: 'APPLE_PAY',
      label: t('Apple Pay', 'أبل باي (Apple Pay)'),
      icon: <Smartphone className="w-5 h-5 text-slate-900" />,
      description: t('One-touch secure payment via Face ID / Touch ID.', 'دفع فوري وآمن بلمسة واحدة عبر Face ID.'),
      badge: t('Instant', 'فوري'),
    },
    {
      id: 'STC_PAY',
      label: t('STC Pay', 'اس تي سي باي (STC Pay)'),
      icon: <div className="w-5 h-5 rounded-md bg-purple-700 text-white font-bold text-[9px] flex items-center justify-center">stc</div>,
      description: t('Direct payment from your STC Pay digital wallet.', 'خصم مباشر وسريع من محفظة STC Pay الرقمية.'),
      badge: t('Wallet', 'محفظة رقمية'),
    },
    {
      id: 'CREDIT_CARD',
      label: t('Visa / Mastercard', 'فيزا وماستركارد (Credit Card)'),
      icon: <CreditCard className="w-5 h-5 text-blue-600" />,
      description: t('Worldwide Visa and Mastercard accepted.', 'مقبولة عبر بطاقات فيزا وماستركارد العالمية.'),
    },
    {
      id: 'AMEX',
      label: t('American Express (Amex)', 'أمريكان إكسبريس (Amex)'),
      icon: <div className="w-5 h-5 rounded-md bg-sky-700 text-white font-black text-[8px] flex items-center justify-center">AMEX</div>,
      description: t('American Express corporate & personal cards.', 'بطاقات أمريكان إكسبريس للشركات والأفراد.'),
    },
    {
      id: 'SAMSUNG_PAY',
      label: t('Samsung Pay', 'سامسونج باي (Samsung Pay)'),
      icon: <Smartphone className="w-5 h-5 text-blue-800" />,
      description: t('Quick biometric checkout on Galaxy devices.', 'دفع سريع ببصمة الإصبع لأجهزة سامسونج جالاكسي.'),
    },
    {
      id: 'COD',
      label: t('Cash on Delivery (COD)', 'الدفع عند الاستلام (نقداً)'),
      icon: <Banknote className="w-5 h-5 text-amber-600" />,
      description: t('Pay in SAR cash when your courier arrives.', 'السداد نقداً بالريال لمندوب التوصيل عند الاستلام.'),
    },
  ];

  // Smart Filter: Only show Apple Pay on Apple devices & Samsung Pay on Samsung devices
  const options = rawOptions.filter((opt) => {
    if (opt.id === 'APPLE_PAY') return isAppleDevice;
    if (opt.id === 'SAMSUNG_PAY') return isSamsungDevice;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm uppercase tracking-widest font-bold text-slate-800">
          {t('Select Payment Method', 'اختر طريقة الدفع')}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {options.map((opt) => {
          const isSelected = selectedMethod === opt.id;
          return (
            <motion.div
              key={opt.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectMethod(opt.id)}
              className={`relative cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/60 shadow-sm ring-2 ring-amber-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100/80 border border-slate-200/50 flex-none">{opt.icon}</div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm leading-snug">{opt.label}</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5 leading-tight">{opt.description}</div>
                  </div>
                </div>
                {opt.badge && (
                  <span className="text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200/60 flex-none">
                    {opt.badge}
                  </span>
                )}
              </div>

              {isSelected && (
                <motion.div
                  layoutId="selectedIndicator"
                  className="mt-3 pt-2 border-t border-amber-200/60 text-xs font-bold text-amber-700 flex items-center gap-1.5"
                >
                  {t('✓ Selected', '✓ تم الاختيار')}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
