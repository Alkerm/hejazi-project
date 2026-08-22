'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Smartphone,
  Banknote,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Fingerprint,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { formatMoney } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { PaymentMethod } from './payment-selector';

interface PaymentFormProps {
  orderId: string;
  orderTotal: number;
  currency?: string;
  selectedMethod: PaymentMethod;
  onPaymentSuccess: (order: Order) => void;
  onPaymentFailure: (errorMessage: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  orderId,
  orderTotal,
  currency = 'SAR',
  selectedMethod,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const { t, lang } = useLanguage();

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Processing & Simulation State
  const [processing, setProcessing] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [applePayAuthenticating, setApplePayAuthenticating] = useState(false);
  const [samsungPayAuthenticating, setSamsungPayAuthenticating] = useState(false);
  const [moyasarTxId, setMoyasarTxId] = useState<string | null>(null);

  // STC Pay State
  const [stcPhone, setStcPhone] = useState('0501234567');
  const [showStcOtpModal, setShowStcOtpModal] = useState(false);

  // Quick Test Auto-Fill Helpers
  const fillTestCard = (type: 'MADA' | 'VISA' | 'MASTER' | 'AMEX' | 'FAIL') => {
    setCardHolder('Abdulaziz Al-Hejazi');
    setExpiry('12/28');
    setCvv('123');

    if (type === 'MADA') {
      setCardNumber('5888 4500 0000 0001');
    } else if (type === 'VISA') {
      setCardNumber('4111 1111 1111 1111');
    } else if (type === 'MASTER') {
      setCardNumber('5555 5555 5555 4444');
    } else if (type === 'AMEX') {
      setCardNumber('3700 0000 0000 004');
    } else if (type === 'FAIL') {
      setCardNumber('4000 0000 0000 0002');
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (raw.length >= 3) {
      setExpiry(`${raw.substring(0, 2)}/${raw.substring(2, 4)}`);
    } else {
      setExpiry(raw);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCvv(raw);
  };

  // Submit Card Payment (Mada / Visa / Master / Amex)
  const handlePayWithCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardHolder || !expiry || !cvv) {
      onPaymentFailure(t('Please complete all card details', 'يرجى إكمال جميع بيانات البطاقة'));
      return;
    }

    setProcessing(true);

    try {
      const pubKey = process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY || 'pk_test_2ZVdKdsdndd55wVuxgvk9WdaKYudGUEQbg61EUdy';
      const authHeader = 'Basic ' + btoa(pubKey + ':');
      const [expMonth, rawYear] = expiry.split('/');
      const expYear = rawYear ? (rawYear.length === 2 ? `20${rawYear}` : rawYear) : '2028';
      const cleanNumber = cardNumber.replace(/\s/g, '');

      // Initiate real transaction with Moyasar sandbox
      const moyasarRes = await fetch('https://api.moyasar.com/v1/payments', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(orderTotal * 100),
          currency: 'SAR',
          description: `Order #${orderId}`,
          callback_url: window.location.href,
          source: {
            type: 'creditcard',
            name: cardHolder,
            number: cleanNumber,
            cvc: cvv,
            month: expMonth,
            year: expYear,
          },
        }),
      });

      const moyasarData = await moyasarRes.json();
      if (moyasarData?.id) {
        setMoyasarTxId(moyasarData.id);
      }
    } catch {
      // Graceful fallback to sandbox OTP flow
    } finally {
      setProcessing(false);
      setShowOtpModal(true);
    }
  };

  // Verify 3D-Secure OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (otpCode !== '1234' && otpCode !== '0000' && otpCode.length < 4) {
      setOtpError(t('Invalid OTP. Use test code 1234.', 'رمز التحقق غير صحيح. استخدم الرمز التجريبي 1234.'));
      return;
    }

    setProcessing(true);

    try {
      // Check if this was a simulated failed card
      const isFailedCard = cardNumber.replace(/\s/g, '').startsWith('40000000');
      if (isFailedCard) {
        throw new Error(
          t(
            'Transaction declined by issuing bank (Simulated insufficient funds)',
            'تم رفض العملية من البنك المصدر (محاكاة رصيد غير كافٍ)'
          )
        );
      }

      const res = await api.verifyPayment({
        orderId,
        paymentMethod: selectedMethod,
        transactionId: moyasarTxId || `moyasar_test_${Date.now()}`,
        gateway: 'MOYASAR',
        status: 'PAID',
        rawResponse: {
          cardType: selectedMethod,
          last4: cardNumber.replace(/\s/g, '').slice(-4),
          cardHolder,
          moyasarTxId,
          verifiedVia: '3D-Secure 2.0 (Mada/Visa Switch)',
        },
      });

      setShowOtpModal(false);
      onPaymentSuccess(res.order);
    } catch (err: any) {
      setShowOtpModal(false);
      onPaymentFailure(err.message || t('Payment failed to process', 'فشلت معالجة عملية الدفع'));
    } finally {
      setProcessing(false);
    }
  };

  // Apple Pay
  const handleApplePay = async () => {
    setApplePayAuthenticating(true);

    setTimeout(async () => {
      try {
        const res = await api.verifyPayment({
          orderId,
          paymentMethod: 'APPLE_PAY',
          transactionId: `apple_pay_${Date.now()}`,
          gateway: 'MOYASAR_APPLE_PAY',
          status: 'PAID',
          rawResponse: {
            cardType: 'APPLE_PAY',
            token: 'device_account_token_simulated',
          },
        });
        setApplePayAuthenticating(false);
        onPaymentSuccess(res.order);
      } catch (err: any) {
        setApplePayAuthenticating(false);
        onPaymentFailure(err.message || t('Apple Pay failed', 'فشلت عملية Apple Pay'));
      }
    }, 1500);
  };

  // Samsung Pay
  const handleSamsungPay = async () => {
    setSamsungPayAuthenticating(true);

    setTimeout(async () => {
      try {
        const res = await api.verifyPayment({
          orderId,
          paymentMethod: 'SAMSUNG_PAY',
          transactionId: `samsung_pay_${Date.now()}`,
          gateway: 'MOYASAR_SAMSUNG_PAY',
          status: 'PAID',
          rawResponse: {
            cardType: 'SAMSUNG_PAY',
            token: 'samsung_device_token_simulated',
          },
        });
        setSamsungPayAuthenticating(false);
        onPaymentSuccess(res.order);
      } catch (err: any) {
        setSamsungPayAuthenticating(false);
        onPaymentFailure(err.message || t('Samsung Pay failed', 'فشلت عملية Samsung Pay'));
      }
    }, 1500);
  };

  // STC Pay Submit
  const handleStcPaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stcPhone || stcPhone.length < 9) {
      onPaymentFailure(t('Please enter a valid Saudi phone number', 'يرجى إدخال رقم جوال سعودي صحيح'));
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setShowStcOtpModal(true);
    }, 1000);
  };

  // STC Pay Verify OTP
  const handleVerifyStcOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (otpCode !== '1234' && otpCode !== '0000' && otpCode.length < 4) {
      setOtpError(t('Invalid OTP. Use test code 1234.', 'رمز التحقق غير صحيح. استخدم الرمز التجريبي 1234.'));
      return;
    }

    setProcessing(true);

    try {
      const res = await api.verifyPayment({
        orderId,
        paymentMethod: 'STC_PAY',
        transactionId: `stcpay_test_${Date.now()}`,
        gateway: 'MOYASAR_STCPAY',
        status: 'PAID',
        rawResponse: {
          wallet: 'STC_PAY',
          mobile: stcPhone,
          verifiedVia: 'STC Pay Sandbox OTP',
        },
      });

      setShowStcOtpModal(false);
      onPaymentSuccess(res.order);
    } catch (err: any) {
      setShowStcOtpModal(false);
      onPaymentFailure(err.message || t('STC Pay failed to process', 'فشلت معالجة عملية الدفع عبر STC Pay'));
    } finally {
      setProcessing(false);
    }
  };

  // Cash on Delivery
  const handleConfirmCod = async () => {
    setProcessing(true);
    try {
      const res = await api.verifyPayment({
        orderId,
        paymentMethod: 'COD',
        gateway: 'COD',
        status: 'PAID',
        rawResponse: { note: 'Cash on delivery selected at checkout' },
      });
      onPaymentSuccess(res.order);
    } catch (err: any) {
      onPaymentFailure(err.message || t('Failed to confirm COD order', 'فشل تأكيد طلب الدفع عند الاستلام'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sandbox Test Mode Assistant Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-amber-600 flex-none animate-bounce" />
          <div>
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              {t('Moyasar Sandbox Test Mode Active', 'بيئة التجربة والاختبار لميسر مفعّلة')}
            </h4>
            <p className="text-[11px] text-amber-800/80 mt-0.5">
              {t('Click below to auto-fill official test cards for Saudi Mada / Visa.', 'انقر بالأسفل لملء بيانات بطاقات الاختبار تلقائياً.')}
            </p>
          </div>
        </div>

        {selectedMethod !== 'COD' && (
          <div className="flex flex-wrap items-center gap-1.5 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => fillTestCard('MADA')}
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs transition-all"
            >
              🇸🇦 {t('Mada Test', 'بطاقة مدى')}
            </button>
            <button
              type="button"
              onClick={() => fillTestCard('VISA')}
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-2xs transition-all"
            >
              💳 {t('Visa Test', 'بطاقة فيزا')}
            </button>
            <button
              type="button"
              onClick={() => fillTestCard('AMEX')}
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-sky-700 hover:bg-sky-800 text-white shadow-2xs transition-all"
            >
              💳 {t('Amex Test', 'أمريكان إكسبريس')}
            </button>
            <button
              type="button"
              onClick={() => fillTestCard('FAIL')}
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-2xs transition-all"
            >
              🚫 {t('Declined Card', 'بطاقة مرفوضة')}
            </button>
          </div>
        )}
      </div>

      {/* RENDER BY METHOD */}

      {/* 1. MADA / VISA / MASTERCARD / AMEX CARD FORM */}
      {(selectedMethod === 'MADA' || selectedMethod === 'CREDIT_CARD' || selectedMethod === 'AMEX') && (
        <form onSubmit={handlePayWithCard} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t('Card Number', 'رقم البطاقة')}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="5888 4500 0000 0001"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                className="w-full text-sm font-mono px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 tracking-wider font-semibold bg-white"
              />
              <div className="absolute right-3 top-3 flex items-center gap-1.5 pointer-events-none">
                <CreditCard className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t('Cardholder Name', 'اسم صاحب البطاقة')}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Abdulaziz Al-Hejazi"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 uppercase font-medium bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('Expiry (MM/YY)', 'تاريخ الانتهاء (شهر/سنة)')}
              </label>
              <input
                type="text"
                required
                placeholder="12/28"
                value={expiry}
                onChange={handleExpiryChange}
                maxLength={5}
                className="w-full text-sm font-mono px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-center font-bold bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('CVV / CVC', 'رمز الأمان (CVV)')}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="123"
                  value={cvv}
                  onChange={handleCvvChange}
                  maxLength={4}
                  className="w-full text-sm font-mono px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-center font-bold bg-white"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={processing}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                {t('Connecting to Saudi Payment Gateway...', 'جاري الاتصال ببوابة الدفع...')}
              </span>
            ) : (
              <span>
                {t('Pay', 'ادفع')} {formatMoney(orderTotal)} {currency}
              </span>
            )}
          </Button>
        </form>
      )}

      {/* 2. APPLE PAY */}
      {selectedMethod === 'APPLE_PAY' && (
        <div className="space-y-4 text-center py-4">
          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-950 text-white flex items-center justify-center mx-auto shadow-md">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{t('Apple Pay Instant Checkout', 'دفع فوري وآمن عبر Apple Pay')}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {t(
                  'Authorize your transaction with Face ID, Touch ID, or your device passcode.',
                  'قم بتأكيد عملية الشراء باستخدام بصمة الوجه أو الإصبع بكل سهولة.'
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={handleApplePay}
              disabled={applePayAuthenticating}
              className="w-full max-w-xs mx-auto py-3.5 px-6 rounded-xl bg-black text-white hover:bg-slate-900 font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              {applePayAuthenticating ? (
                <span className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 animate-pulse text-amber-400" />
                  {t('Authenticating Face ID...', 'جاري التحقق عبر Face ID...')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="text-base">Pay</span>
                  <span>({formatMoney(orderTotal)} {currency})</span>
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 3. SAMSUNG PAY */}
      {selectedMethod === 'SAMSUNG_PAY' && (
        <div className="space-y-4 text-center py-4">
          <div className="p-6 rounded-2xl border border-blue-100 bg-blue-50/40 space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center mx-auto shadow-md">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{t('Samsung Pay Instant Checkout', 'دفع فوري عبر Samsung Pay')}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {t(
                  'Authorize your payment securely with fingerprint authentication on your Samsung device.',
                  'أكّد عملية الشراء عبر بصمة الإصبع لجهاز سامسونج الخاص بك.'
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSamsungPay}
              disabled={samsungPayAuthenticating}
              className="w-full max-w-xs mx-auto py-3.5 px-6 rounded-xl bg-blue-800 text-white hover:bg-blue-900 font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              {samsungPayAuthenticating ? (
                <span className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 animate-pulse text-sky-300" />
                  {t('Authenticating Biometrics...', 'جاري التحقق من البصمة...')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Samsung Pay</span>
                  <span>({formatMoney(orderTotal)} {currency})</span>
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 4. STC PAY */}
      {selectedMethod === 'STC_PAY' && (
        <form onSubmit={handleStcPaySubmit} className="space-y-4">
          <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/50 space-y-3">
            <div className="flex items-center gap-2 text-purple-950 font-bold text-sm">
              <div className="w-6 h-6 rounded-md bg-purple-700 text-white font-bold text-[10px] flex items-center justify-center">stc</div>
              <span>{t('STC Pay Digital Wallet', 'محفظة STC Pay الرقمية')}</span>
            </div>
            <p className="text-xs text-purple-900/80 leading-relaxed">
              {t(
                'Enter your Saudi phone number registered with STC Pay. We will send an SMS OTP to authorize the payment.',
                'أدخل رقم جوالك المسجل في STC Pay وسيصلك رمز تحقق عبر الرسائل النصية لتأكيد الخصم.'
              )}
            </p>

            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-purple-950">
                {t('STC Pay Mobile Number', 'رقم الجوال المسجل في STC Pay')}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="0501234567"
                  value={stcPhone}
                  onChange={(e) => setStcPhone(e.target.value)}
                  className="w-full text-sm font-mono px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 tracking-wider font-semibold bg-white"
                />
                <span className="absolute right-3 top-3 text-xs text-purple-700 font-bold">🇸🇦 +966</span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={processing}
            className="w-full py-4 bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-700/20 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                {t('Connecting to STC Pay...', 'جاري الاتصال بـ STC Pay...')}
              </span>
            ) : (
              <span>
                {t('Pay with STC Pay', 'سداد عبر STC Pay')} ({formatMoney(orderTotal)} {currency})
              </span>
            )}
          </Button>
        </form>
      )}

      {/* 5. CASH ON DELIVERY (COD) */}
      {selectedMethod === 'COD' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/60 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Banknote className="w-5 h-5 text-amber-600" />
              <span>{t('Cash on Delivery Confirmed', 'الدفع نقداً عند الاستلام')}</span>
            </div>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              {t(
                'You will pay the exact amount in cash directly to our delivery courier upon receiving your package in Saudi Arabia.',
                'ستقوم بسداد المبلغ نقداً ومباشرة لمندوب التوصيل عند استلام شحنتك داخل المملكة.'
              )}
            </p>
          </div>

          <Button
            type="button"
            variant="dark"
            onClick={handleConfirmCod}
            disabled={processing}
            className="w-full py-4 font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-amber-400"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                <span>{t('Confirming Order...', 'جاري تأكيد الطلب...')}</span>
              </span>
            ) : (
              <span className="text-amber-400 font-bold">{t('Confirm Order (Pay on Delivery)', 'تأكيد الطلب والدفع عند الاستلام')}</span>
            )}
          </Button>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>{t('256-Bit SSL Encrypted & Saudi Payment Gateway Compliant', 'مشفر باتصال آمن 256 بت ومتوافق مع بوابات الدفع السعودية')}</span>
      </div>

      {/* 3D-SECURE OTP MODAL (Cards) */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                    مدى
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">3D-Secure 2.0 Verification</h3>
                    <p className="text-[10px] text-slate-400">Saudi National Payment Switch (MADA / Visa)</p>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>{t('Merchant:', 'المتجر:')}</span>
                  <strong className="text-slate-900">Hejazi Cosmetics (Half Link)</strong>
                </div>
                <div className="flex justify-between">
                  <span>{t('Amount:', 'المبلغ:')}</span>
                  <strong className="text-slate-900">{formatMoney(orderTotal)} {currency}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{t('Card ending in:', 'البطاقة المنتهية بـ:')}</span>
                  <strong className="text-slate-900">•••• {cardNumber.slice(-4) || '0001'}</strong>
                </div>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {t('Enter SMS Verification Code', 'أدخل رمز التحقق المرسل لهاتفك')}
                  </label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="1234"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    className="w-full text-center text-xl tracking-widest font-mono font-black py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                  />
                  <p className="text-[11px] text-emerald-700 font-medium text-center">
                    {t('💡 Test Sandbox OTP: Enter 1234 to approve', '💡 رمز الاختبار التجريبي: اكتب 1234 للموافقة')}
                  </p>
                </div>

                {otpError && (
                  <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-none" />
                    <span>{otpError}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowOtpModal(false)}
                    className="w-1/3 py-2.5 text-xs border-slate-200"
                  >
                    {t('Cancel', 'إلغاء')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={processing}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                  >
                    {processing ? t('Verifying...', 'جاري التحقق...') : t('Submit & Pay', 'تأكيد وسداد')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STC PAY OTP MODAL */}
      <AnimatePresence>
        {showStcOtpModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-purple-100 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-700 text-white font-bold text-xs flex items-center justify-center">
                    stc
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">STC Pay Wallet Verification</h3>
                    <p className="text-[10px] text-purple-700">Digital Direct Deduction</p>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-purple-700" />
              </div>

              <div className="bg-purple-50/50 p-4 rounded-2xl space-y-1.5 text-xs text-purple-900">
                <div className="flex justify-between">
                  <span>{t('Mobile Number:', 'رقم الجوال:')}</span>
                  <strong className="text-purple-950 font-mono">{stcPhone}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{t('Amount to Deduct:', 'المبلغ المطلوب خصمه:')}</span>
                  <strong className="text-purple-950">{formatMoney(orderTotal)} {currency}</strong>
                </div>
              </div>

              <form onSubmit={handleVerifyStcOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {t('Enter STC Pay SMS OTP Code', 'أدخل رمز التحقق المرسل إلى تطبيقك')}
                  </label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="1234"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    className="w-full text-center text-xl tracking-widest font-mono font-black py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 bg-white"
                  />
                  <p className="text-[11px] text-purple-700 font-medium text-center">
                    {t('💡 Test Sandbox OTP: Enter 1234 to approve', '💡 رمز الاختبار التجريبي: اكتب 1234 للموافقة')}
                  </p>
                </div>

                {otpError && (
                  <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-none" />
                    <span>{otpError}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowStcOtpModal(false)}
                    className="w-1/3 py-2.5 text-xs border-slate-200"
                  >
                    {t('Cancel', 'إلغاء')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={processing}
                    className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md"
                  >
                    {processing ? t('Confirming...', 'جاري الخصم...') : t('Authorize & Pay', 'تأكيد السداد')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
