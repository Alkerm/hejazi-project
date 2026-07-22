'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (en: string, ar: string) => string;
  formatProductName: (product: { name: string; arabicName?: string | null }) => string;
  formatPrice: (amount: number | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('hejazi_lang') as Language;
    if (saved === 'en' || saved === 'ar') {
      setLangState(saved);
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
    } else {
      document.documentElement.dir = 'rtl';
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('hejazi_lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  const formatProductName = (product: { name: string; arabicName?: string | null }) => {
    if (lang === 'ar' && product.arabicName) {
      return product.arabicName;
    }
    return product.name;
  };

  const formatPrice = (amount: number | string) => {
    const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
    const formatted = isNaN(numeric) ? '0.00' : numeric.toFixed(2);
    return lang === 'ar' ? `${formatted} ر.س` : `SAR ${formatted}`;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t, formatProductName, formatPrice }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
