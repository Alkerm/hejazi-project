'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Banknote, ShieldCheck } from 'lucide-react';

export type PaymentMethod = 'COD' | 'CREDIT_CARD' | 'MADA' | 'APPLE_PAY';

interface PaymentSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({ selectedMethod, onSelectMethod }) => {
  const options: { id: PaymentMethod; label: string; icon: React.ReactNode; description: string; badge?: string }[] = [
    {
      id: 'MADA',
      label: 'Mada Debit Card (مدى)',
      icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
      description: 'Pay instantly using your Saudi Mada card.',
      badge: 'Popular in KSA',
    },
    {
      id: 'APPLE_PAY',
      label: 'Apple Pay',
      icon: <Smartphone className="w-5 h-5 text-neutral-900 dark:text-neutral-100" />,
      description: 'One-touch secure payment via Apple Pay.',
      badge: 'Fastest',
    },
    {
      id: 'CREDIT_CARD',
      label: 'Credit / Debit Card',
      icon: <CreditCard className="w-5 h-5 text-indigo-600" />,
      description: 'Visa and Mastercard accepted.',
    },
    {
      id: 'COD',
      label: 'Cash on Delivery (الدفع عند الاستلام)',
      icon: <Banknote className="w-5 h-5 text-amber-600" />,
      description: 'Pay in SAR cash when your courier arrives.',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Select Payment Method</h3>
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
          <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Encrypted
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = selectedMethod === opt.id;
          return (
            <motion.div
              key={opt.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectMethod(opt.id)}
              className={`relative cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm ring-2 ring-emerald-600/20'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">{opt.icon}</div>
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">{opt.label}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{opt.description}</div>
                  </div>
                </div>
                {opt.badge && (
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    {opt.badge}
                  </span>
                )}
              </div>

              {isSelected && (
                <motion.div
                  layoutId="selectedIndicator"
                  className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
                >
                  ✓ Selected
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
