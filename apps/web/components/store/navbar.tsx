'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
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
  const isLoginPage = pathname === '/' || pathname === '/login';
  const isProductsRoute = pathname === '/products' || pathname.startsWith('/products/');
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isProfileRoute = pathname === '/profile' || pathname.startsWith('/profile/');
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

  const [auth, setAuth] = useState<{ isAuthenticated: boolean; role: 'USER' | 'ADMIN' | null }>({
    isAuthenticated: false,
    role: null,
  });
  const [authChecked, setAuthChecked] = useState(false);
  const adminLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/inventory', label: 'Inventory' },
    { href: '/admin/analytics', label: 'Analytics' },
    { href: '/profile', label: 'Profile' },
  ];

  useEffect(() => {
    if (hasAuthHintCookie()) {
      setAuth((prev) => ({ ...prev, isAuthenticated: true }));
    }

    api
      .me()
      .then((me) => setAuth({ isAuthenticated: true, role: me.role }))
      .catch(() => setAuth({ isAuthenticated: false, role: null }))
      .finally(() => setAuthChecked(true));
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } finally {
      clearAuthHintCookie();
      setAuth({ isAuthenticated: false, role: null });
      window.location.href = '/';
    }
  };

  const isAdminSection = isAdminRoute || (isProfileRoute && auth.role === 'ADMIN');
  const isAdminLinkActive = (href: string) =>
    href === '/admin'
      ? pathname === '/admin'
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div
        className={`mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3 ${isLoginPage ? 'justify-center' : 'justify-between'}`}
      >
        <Link href="/" className="text-xl font-bold text-brand-700">
          Hejazi Cosmetics
        </Link>

        {isLoginPage ? null : isAdminSection ? (
          <nav className="flex max-w-full items-center gap-2 overflow-x-auto pb-1 text-sm font-medium text-slate-700">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded px-3 py-2 font-semibold ${isAdminLinkActive(link.href) ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                {link.label}
              </Link>
            ))}
            <Button type="button" variant="secondary" className="whitespace-nowrap px-3 py-1.5" onClick={handleLogout}>
              Logout
            </Button>
          </nav>
        ) : (
          <nav className="flex flex-wrap items-center justify-end gap-4 text-sm font-medium text-slate-700">
            {auth.isAuthenticated ? (
              <>
                {!isProductsRoute && <Link href="/products">Products</Link>}
                <Link href="/cart">Cart</Link>
                <Link href="/orders">Orders</Link>
                <Link href="/profile">Profile</Link>
                <Button type="button" variant="secondary" className="px-3 py-1.5" onClick={handleLogout}>
                  Logout
                </Button>
                {auth.role === 'ADMIN' && <Link href="/admin">Admin</Link>}
              </>
            ) : !isProtectedRoute && authChecked ? (
              <>
                <Link href="/">Login</Link>
                <Link href="/register">Register</Link>
              </>
            ) : null}
          </nav>
        )}
      </div>
    </header>
  );
}
