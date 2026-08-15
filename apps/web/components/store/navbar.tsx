'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Globe, Shield, ShoppingBag, Heart, User, LogOut, Grid } from 'lucide-react';
import { toast } from 'sonner';
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

  const [mounted, setMounted] = useState(false);
  const [hasAuthHint, setHasAuthHint] = useState(false);
  const [auth, setAuth] = useState<{ isAuthenticated: boolean; role: 'USER' | 'ADMIN' | 'DRIVER' | null }>({
    isAuthenticated: false,
    role: null,
  });
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
      );
  }, []);

  useEffect(() => {
    if (mounted) {
      api
        .cart()
        .then((c) => setCartCount(c.summary.totalItems))
        .catch(() => setCartCount(0));
    }
  }, [mounted, currentPath]);

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
  const isDriverSection = currentPath === '/driver' || currentPath.startsWith('/driver/');
  const isLoginPage = currentPath === '/login' || currentPath === '/register';

  return (
    <header className="sticky top-0 z-50 glass-panel shadow-sm transition-all duration-300">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-amber-400 font-serif text-lg font-bold shadow-sm transition duration-300 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:scale-105">
              HL
            </div>
            <div className="flex flex-col leading-none">
              <span className="serif-font text-xl font-bold tracking-widest text-slate-900 transition duration-300 group-hover:text-amber-700">
                HALF LINK
              </span>
              <span className="text-[9px] tracking-[0.3em] font-extrabold text-amber-600 uppercase mt-0.5">
                ENERGY & SECURITY
              </span>
            </div>
          </Link>

          {/* Admin Badge for Admin Users */}
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

        {/* Navigation Action Icons & Links */}
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
          {/* Products Direct Link */}
          <Link
            href="/products"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 text-xs font-bold text-slate-800 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 transition shadow-2xs"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>{t('Products', 'المنتجات')}</span>
          </Link>
          {/* Language Switcher */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={toggleLanguage}
            className="relative p-2 text-slate-700 hover:text-amber-600 transition-colors rounded-full hover:bg-slate-100"
            title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
          >
            <Globe className="w-5 h-5 stroke-[1.75]" />
            <span className="absolute -top-0.5 -right-1 flex h-4 min-w-[18px] items-center justify-center rounded-full bg-slate-800 text-[8px] font-extrabold uppercase text-white shadow-2xs px-1">
              {lang === 'ar' ? 'EN' : 'AR'}
            </span>
          </button>

          {!isDriverSection && (
            <>
              {/* Cart Icon */}
              <Link
                href="/cart"
                className={`relative p-2 text-slate-700 hover:text-amber-600 transition-colors rounded-full hover:bg-slate-100 ${
                  currentPath.startsWith('/cart') ? 'text-amber-600 bg-slate-100' : ''
                }`}
                title={t('Cart', 'السلة')}
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white shadow-xs">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Wishlist Icon (Shown ONLY when signed in) */}
              {isSignedIn && (
                <Link
                  href="/wishlist"
                  className={`p-2 text-slate-700 hover:text-rose-500 transition-colors rounded-full hover:bg-slate-100 ${
                    currentPath.startsWith('/wishlist') ? 'text-rose-500 bg-slate-100' : ''
                  }`}
                  title={t('Wishlist', 'المفضلة')}
                >
                  <Heart className="w-5 h-5 stroke-[1.75]" />
                </Link>
              )}

              {/* Account Icon (Shown ONLY when signed in) */}
              {isSignedIn && (
                <Link
                  href="/profile"
                  className={`p-2 text-slate-700 hover:text-amber-600 transition-colors rounded-full hover:bg-slate-100 ${
                    currentPath.startsWith('/profile') ? 'text-amber-600 bg-slate-100' : ''
                  }`}
                  title={t('Profile', 'حسابي')}
                >
                  <User className="w-5 h-5 stroke-[1.75]" />
                </Link>
              )}
            </>
          )}

          {/* Conditional Login / Logout Buttons */}
          {isSignedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors rounded-full border border-red-200/80 shadow-2xs"
              title={t('Log Out', 'تسجيل الخروج')}
            >
              <LogOut className="w-5 h-5 stroke-[1.75]" />
            </button>
          ) : !isLoginPage ? (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-xs font-semibold text-slate-700 hover:text-amber-600 transition-colors">
                {t('Login', 'دخول')}
              </Link>
              <Link href="/register" className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-amber-400 shadow-sm transition hover:bg-amber-500 hover:text-slate-950">
                {t('Register', 'تسجيل حساب')}
              </Link>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
