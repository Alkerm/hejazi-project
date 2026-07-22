'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';

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
  const pathname = usePathname();
  const { lang, toggleLanguage, t } = useLanguage();
  const initialHasAuthHint = hasAuthHintCookie();
  const isLoginPage = pathname === '/' || pathname === '/login';
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isProtectedRoute =
    pathname === '/products' ||
    pathname.startsWith('/products/') ||
    pathname === '/cart' ||
    pathname.startsWith('/cart/') ||
    pathname === '/orders' ||
    pathname.startsWith('/orders/') ||
    pathname === '/profile' ||
    pathname.startsWith('/profile/') ||
    isAdminRoute;

  const [hasAuthHint, setHasAuthHint] = useState(initialHasAuthHint);
  const [auth, setAuth] = useState<{ isAuthenticated: boolean; role: 'USER' | 'ADMIN' | null }>({
    isAuthenticated: initialHasAuthHint,
    role: null,
  });
  const [authChecked, setAuthChecked] = useState(false);
  const adminLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/driver', label: 'Driver Portal' },
    { href: '/admin/inventory', label: 'Inventory' },
    { href: '/admin/reviews', label: 'Reviews' },
    { href: '/admin/coupons', label: 'Coupons' },
    { href: '/admin/support', label: 'Support' },
    { href: '/admin/analytics', label: 'Analytics' },
    { href: '/admin/audit-logs', label: 'Audit Logs' },
    { href: '/profile', label: 'Profile' },
  ];

  useEffect(() => {
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

  const isSignedIn = auth.isAuthenticated || hasAuthHint;
  const isAdminSection =
    isAdminRoute || auth.role === 'ADMIN' || (isSignedIn && pathname === '/profile');
  const isAdminLinkActive = (href: string) =>
    href === '/admin'
      ? pathname === '/admin'
      : pathname === href || pathname.startsWith(`${href}/`);
  const customerLinkClass = (href: string) =>
    `relative text-sm font-medium tracking-wide text-slate-600 transition-colors duration-200 hover:text-brand-500 py-1 ${
      pathname === href || pathname.startsWith(`${href}/`)
        ? 'text-brand-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-brand-500 after:rounded-full'
        : 'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-brand-500 after:transition-all after:duration-200 hover:after:w-full'
    }`;

  return (
    <header className="sticky top-0 z-50 glass-panel shadow-sm transition-all duration-300">
      <div
        className={`mx-auto flex w-full max-w-6xl flex-wrap items-center gap-4 px-6 py-4 ${isLoginPage ? 'justify-center' : 'justify-between'}`}
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="group flex items-center gap-2">
            <span className="serif-font text-2xl font-bold tracking-wider text-slate-800 transition duration-300 group-hover:text-brand-600">
              Hejazi
            </span>
            <span className="text-xs tracking-[0.2em] font-semibold text-luxury-gold uppercase border-l border-slate-300 pl-2">
              Cosmetics
            </span>
          </Link>

          {/* Language Switcher Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            {lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}
          </button>
        </div>

        {isLoginPage ? null : isAdminSection ? (
          <nav className="flex max-w-full items-center gap-2 overflow-x-auto pb-1 text-sm font-medium text-slate-700">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs uppercase tracking-wider font-semibold transition duration-200 hover:-translate-y-0.5 ${isAdminLinkActive(link.href) ? 'bg-slate-900 text-white shadow-sm' : 'bg-white/60 text-slate-700 border border-slate-200/60 hover:bg-white hover:border-slate-300'}`}
              >
                {link.label}
              </Link>
            ))}
            <Button type="button" variant="secondary" className="whitespace-nowrap border-slate-200/80 bg-white/60 px-4 py-2 hover:bg-white text-xs uppercase tracking-wider text-red-600 border hover:border-red-200" onClick={handleLogout}>
              Logout
            </Button>
          </nav>
        ) : (
          <nav className="flex flex-wrap items-center justify-end gap-6 text-sm font-medium text-slate-700">
            {isSignedIn ? (
              <>
                <Link href="/products" className={customerLinkClass('/products')}>
                  {t('Products', 'المنتجات')}
                </Link>
                <Link href="/cart" className={customerLinkClass('/cart')}>
                  {t('Cart', 'السلة')}
                </Link>
                <Link href="/wishlist" className={customerLinkClass('/wishlist')}>
                  {t('Wishlist', 'المفضلة')}
                </Link>
                <Link href="/orders" className={customerLinkClass('/orders')}>
                  {t('Orders', 'طلباتي')}
                </Link>
                <Link href="/profile" className={customerLinkClass('/profile')}>
                  {t('Profile', 'حسابي')}
                </Link>
                <button
                  type="button"
                  className="ml-2 text-xs uppercase tracking-wider font-bold text-slate-500 hover:text-red-500 transition-colors"
                  onClick={handleLogout}
                >
                  {t('Logout', 'خروج')}
                </button>
              </>
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
