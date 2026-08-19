'use client';

import React from 'react';
import { Phone, Truck } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface OrderTrackerStepperProps {
  status: string;
  driverName?: string | null;
  driverPhone?: string | null;
  compact?: boolean;
}

export function OrderTrackerStepper({
  status,
  driverName,
  driverPhone,
  compact = false,
}: OrderTrackerStepperProps) {
  const { t } = useLanguage();

  const orderSteps = [
    { key: 'PENDING', labelEn: 'Order Placed', labelAr: 'تم تقديم الطلب' },
    { key: 'CONFIRMED', labelEn: 'Confirmed', labelAr: 'تم التأكيد والجهوزية' },
    { key: 'PROCESSING', labelEn: 'Ready to Dispatch', labelAr: 'جاهز للتسليم والإنطلاق' },
    { key: 'SHIPPED', labelEn: 'Out for Delivery', labelAr: 'جاري التوصيل' },
    { key: 'DELIVERED', labelEn: 'Delivered', labelAr: 'تم التوصيل بنجاح' },
  ];

  const statusIndexMap: Record<string, number> = {
    PENDING: 0,
    CONFIRMED: 1,
    PROCESSING: 2,
    SHIPPED: 3,
    DELIVERED: 4,
  };

  if (status === 'CANCELLED') {
    return (
      <div className="rounded-xl bg-red-50 p-3 border border-red-200 text-red-700 text-xs font-bold text-center">
        {t('This order has been cancelled.', 'تم إلغاء هذا الطلب.')}
      </div>
    );
  }

  const currentStepIndex = statusIndexMap[status] ?? 0;

  return (
    <div className="w-full space-y-3">
      {!compact && (
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {t('Live Order Tracking', 'متابعة حالة الطلب والشحنة مباشر')}
          </span>
        </div>
      )}

      <div className="w-full py-1">
        <div className="flex items-start justify-between w-full">
          {orderSteps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isNextActive = idx + 1 <= currentStepIndex;
            const isLast = idx === orderSteps.length - 1;

            return (
              <div key={step.key} className="flex-1 flex flex-col items-center relative">
                {/* Horizontal Bar Row containing [Left Line Half] [Circle Node] [Right Line Half] */}
                <div className="flex items-center w-full">
                  {/* Left Line Half */}
                  {idx > 0 ? (
                    <div
                      className={`flex-1 h-1 transition-all duration-500 ${
                        isCompleted ? 'bg-amber-500' : 'bg-slate-200'
                      }`}
                    />
                  ) : (
                    <div className="flex-1 h-1 bg-transparent" />
                  )}

                  {/* Step Circle Node with Pulsing Outer Ring Only */}
                  <div className="relative flex items-center justify-center flex-none z-10">
                    {/* Outer Orange Pulsing Ring/Halo (Only this pulses) */}
                    {isCurrent && (
                      <span className="absolute -inset-1 sm:-inset-1.5 rounded-full bg-amber-400/50 animate-pulse pointer-events-none" />
                    )}

                    {/* Original Solid Base Circle around the Number (Steady, No pulse) */}
                    <div
                      className={`relative flex items-center justify-center rounded-full font-black transition-all ${
                        compact ? 'h-7 w-7 text-[10px]' : 'h-8 w-8 text-xs'
                      } ${
                        isCompleted
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </div>
                  </div>

                  {/* Right Line Half */}
                  {!isLast ? (
                    <div
                      className={`flex-1 h-1 transition-all duration-500 ${
                        isNextActive ? 'bg-amber-500' : 'bg-slate-200'
                      }`}
                    />
                  ) : (
                    <div className="flex-1 h-1 bg-transparent" />
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`text-[10px] sm:text-xs font-semibold text-center leading-tight mt-1.5 ${
                    compact ? 'max-w-[70px]' : 'max-w-[85px] sm:max-w-none'
                  } ${
                    isCurrent ? 'text-amber-600 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {t(step.labelEn, step.labelAr)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {driverName && (
        <div className="mt-3 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-3 border border-amber-200/80 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-800 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              {t('Assigned Courier Driver', 'السائق المسؤول عن التوصيل')}
            </span>
            <div className="flex items-center gap-2.5 flex-wrap">
              <p className="font-extrabold text-sm text-slate-900">{driverName}</p>
              {driverPhone && (
                <a
                  href={`tel:${driverPhone}`}
                  className="inline-flex items-center gap-1.5 bg-slate-950 text-amber-400 border border-amber-500/30 font-bold px-3 py-1 rounded-full text-xs hover:bg-amber-400 hover:text-slate-950 transition shadow-2xs"
                  title={t('Call Driver', 'الاتصال بالسائق')}
                >
                  <Phone className="w-3 h-3 fill-current" />
                  <span className="font-mono text-xs tracking-wide">{driverPhone}</span>
                </a>
              )}
            </div>
          </div>

          <span className="text-[11px] bg-amber-200/80 text-amber-900 font-black px-3 py-1 rounded-full border border-amber-300/50">
            {t('Out for Delivery', 'جاري التوصيل إلى عنوانك')}
          </span>
        </div>
      )}
    </div>
  );
}
