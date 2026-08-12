'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Banknote, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export type PaymentMethod = 'COD' | 'CREDIT_CARD' | 'MADA' | 'APPLE_PAY';

interface PaymentSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({ selectedMethod, onSelectMethod }) => {
  const { t } = useLanguage();

  const options: { id: PaymentMethod; label: string; icon: React.ReactNode; description: string; badge?: string }[] = [
    {
      id: 'MADA',
      label: t('Mada Debit Card (مدى)', 'بطاقة مدى (Mada)'),
      icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
      description: t('Pay instantly using your Saudi Mada card.', 'الدفع الفوري باستخدام بطاقة مدى السعودية.'),
      badge: t('Popular in KSA', 'الأكثر شعبية بالمملكة'),
    },
    {
      id: 'APPLE_PAY',
      label: t('Apple Pay', 'أبل باي (Apple Pay)'),
      icon: <Smartphone className="w-5 h-5 text-slate-900" />,
      description: t('One-touch secure payment via Apple Pay.', 'دفع آمن بلمسة واحدة عبر Apple Pay.'),
      badge: t('Fastest', 'الأسرع'),
    },
    {
      id: 'CREDIT_CARD',
      label: t('Credit / Debit Card', 'البطاقة الائتمانية'),
      icon: <CreditCard className="w-5 h-5 text-indigo-600" />,
      description: t('Visa and Mastercard accepted.', 'مقبولة عبر فيزا وماستركارد.'),
    },
    {
      id: 'COD',
      label: t('Cash on Delivery (الدفع عند الاستلام)', 'الدفع عند الاستلام (نقداً)'),
      icon: <Banknote className="w-5 h-5 text-amber-600" />,
      description: t('Pay in SAR cash when your courier arrives.', 'الدفع نقداً بالريال عند وصول مندوب التوصيل.'),
    },
  ];

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
                  ? 'border-emerald-600 bg-emerald-50/60 shadow-sm ring-2 ring-emerald-600/20'
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
                  <span className="text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200/60 flex-none">
                    {opt.badge}
                  </span>
                )}
              </div>

              {isSelected && (
                <motion.div
                  layoutId="selectedIndicator"
                  className="mt-3 pt-2 border-t border-emerald-200/60 text-xs font-bold text-emerald-700 flex items-center gap-1.5"
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
