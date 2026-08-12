'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Globe, Shield, ShoppingBag, Heart, User, LogOut } from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';

const hasAuthHintCookie = () =>
  typeof document !== 'undefined' &&
  document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .some((cookie) => cookie.startsWith('cosmetics_sid_hint='));

const clearAuthHintCookie = () => {
  document.cookie = 'cosmetics_sid_hint=; Max-Age=0; path=/';
};

export function Navbar() {
  const rawPathname = usePathname();
  const currentPath = rawPathname || '';
  const { lang, toggleLanguage, t } = useLanguage();
  const initialHasAuthHint = hasAuthHintCookie();
  const isLoginPage = currentPath === '/' || currentPath === '/login';
  const isProtectedRoute =
    currentPath === '/products' ||
    currentPath.startsWith('/products/') ||
    currentPath === '/cart' ||
    currentPath.startsWith('/cart/') ||
    currentPath === '/orders' ||
    currentPath.startsWith('/orders/') ||
    currentPath === '/profile' ||
    currentPath.startsWith('/profile/');

  const [mounted, setMounted] = useState(false);
  const [hasAuthHint, setHasAuthHint] = useState(false);
  const [auth, setAuth] = useState<{ isAuthenticated: boolean; role: 'USER' | 'ADMIN' | 'DRIVER' | null }>({
    isAuthenticated: false,
    role: null,
  });
  const [authChecked, setAuthChecked] = useState(false);
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    const hasHint = hasAuthHintCookie();
    setHasAuthHint(hasHint);

    if (hasHint) {
      setAuth((prev) => ({ ...prev, isAuthenticated: true }));
    }

    api
      .me()
      .then((me) => setAuth({ isAuthenticated: true, role: me.role }))
      .catch(() =>
        setAuth((prev) => (prev.isAuthenticated ? prev : { isAuthenticated: false, role: null })),
      )
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (mounted && (auth.isAuthenticated || hasAuthHint)) {
      api
        .cart()
        .then((c) => setCartCount(c.summary.totalItems))
        .catch(() => {});
    }
  }, [mounted, auth.isAuthenticated, hasAuthHint, currentPath]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } finally {
      clearAuthHintCookie();
      setHasAuthHint(false);
      setAuth({ isAuthenticated: false, role: null });
      window.location.href = '/';
    }
  };

  const isSignedIn = mounted && (auth.isAuthenticated || hasAuthHint);
  const customerLinkClass = (href: string) =>
    `relative text-sm font-semibold tracking-wide text-slate-700 transition-colors duration-200 hover:text-brand-600 py-1 ${
      currentPath === href || currentPath.startsWith(`${href}/`)
        ? 'text-brand-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-brand-600 after:rounded-full'
        : 'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-brand-600 after:transition-all after:duration-200 hover:after:w-full'
    }`;

  const isDriverSection = currentPath === '/driver' || currentPath.startsWith('/driver/');

  return (
    <header className="sticky top-0 z-50 glass-panel shadow-sm transition-all duration-300">
      <div
        className={`mx-auto flex w-full max-w-6xl flex-wrap items-center gap-4 px-6 py-4 ${isLoginPage ? 'justify-center' : 'justify-between'}`}
      >
        <div className="flex items-center gap-4">
          <Link href={isDriverSection ? '/driver' : '/products'} className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-amber-400 font-serif text-lg font-bold shadow-sm transition duration-300 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:scale-105">
              H
            </div>
            <div className="flex flex-col leading-none">
              <span className="serif-font text-xl font-bold tracking-widest text-slate-900 transition duration-300 group-hover:text-amber-700">
                HEJAZI
              </span>
              <span className="text-[9px] tracking-[0.3em] font-extrabold text-amber-600 uppercase mt-0.5">
                COSMETICS
              </span>
            </div>
          </Link>

          {/* Admin Switcher Badge for Admins */}
          {auth.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('Admin Panel', 'لوحة التحكم')}</span>
            </Link>
          )}
        </div>

        {isLoginPage ? null : (
          <nav className="flex flex-wrap items-center justify-end gap-6 text-sm font-medium text-slate-700">
            {isDriverSection ? (
              <div className="flex items-center gap-3">
                {/* Language Switcher Toggle */}
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={toggleLanguage}
                  className="relative p-2 text-slate-700 hover:text-brand-600 transition-colors rounded-full hover:bg-slate-100"
                  title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
                >
                  <Globe className="w-6 h-6 stroke-[1.75]" />
                  <span className="absolute -top-0.5 -right-1 flex h-4 min-w-[18px] items-center justify-center rounded-full bg-slate-800 text-[8px] font-extrabold uppercase text-white shadow-2xs px-1">
                    {lang === 'ar' ? 'EN' : 'AR'}
                  </span>
                </button>

                <button
                  type="button"
                  suppressHydrationWarning
                  className="text-xs uppercase tracking-wider font-bold text-slate-700 hover:text-red-600 transition-colors bg-slate-100/80 hover:bg-slate-200 px-4 py-2 rounded-xl border border-slate-200/80 shadow-2xs"
                  onClick={handleLogout}
                >
                  {t('Logout', 'خروج')}
                </button>
              </div>
            ) : isSignedIn ? (
              <div className="flex items-center gap-3">
                {/* Language Switcher Toggle */}
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={toggleLanguage}
                  className="relative p-2 text-slate-700 hover:text-brand-600 transition-colors rounded-full hover:bg-slate-100"
                  title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
                >
                  <Globe className="w-6 h-6 stroke-[1.75]" />
                  <span className="absolute -top-0.5 -right-1 flex h-4 min-w-[18px] items-center justify-center rounded-full bg-slate-800 text-[8px] font-extrabold uppercase text-white shadow-2xs px-1">
                    {lang === 'ar' ? 'EN' : 'AR'}
                  </span>
                </button>

                {/* Cart Icon with Counter Badge */}
                <Link
                  href="/cart"
                  className={`relative p-2 text-slate-700 hover:text-brand-600 transition-colors rounded-full hover:bg-slate-100 ${
                    currentPath.startsWith('/cart') ? 'text-brand-600 bg-slate-100' : ''
                  }`}
                  title={t('Cart', 'السلة')}
                >
                  <ShoppingBag className="w-6 h-6 stroke-[1.75]" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white shadow-xs animate-scale-in">
                    {cartCount}
                  </span>
                </Link>

                {/* Wishlist Icon */}
                <Link
                  href="/wishlist"
                  className={`p-2 text-slate-700 hover:text-rose-500 transition-colors rounded-full hover:bg-slate-100 ${
                    currentPath.startsWith('/wishlist') ? 'text-rose-500 bg-slate-100' : ''
                  }`}
                  title={t('Wishlist', 'المفضلة')}
                >
                  <Heart className="w-6 h-6 stroke-[1.75]" />
                </Link>

                {/* Profile Icon */}
                <Link
                  href="/profile"
                  className={`p-2 text-slate-700 hover:text-brand-600 transition-colors rounded-full hover:bg-slate-100 ${
                    currentPath.startsWith('/profile') ? 'text-brand-600 bg-slate-100' : ''
                  }`}
                  title={t('Profile', 'حسابي')}
                >
                  <User className="w-6 h-6 stroke-[1.75]" />
                </Link>

                {/* Customer Red Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors rounded-full border border-red-200/80 shadow-2xs"
                  title={t('Log Out', 'تسجيل الخروج')}
                >
                  <LogOut className="w-5 h-5 stroke-[1.75]" />
                </button>
              </div>
            ) : !isProtectedRoute && authChecked && !hasAuthHint ? (
              <div className="flex items-center gap-4">
                <Link href="/" className="text-sm font-medium text-slate-600 hover:text-brand-500 transition-colors">
                  {t('Login', 'دخول')}
                </Link>
                <Link href="/register" className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-md">
                  {t('Register', 'تسجيل حساب')}
                </Link>
              </div>
            ) : null}
          </nav>
        )}
      </div>
    </header>
  );
}

