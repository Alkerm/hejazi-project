'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export function Navbar() {
  const [auth, setAuth] = useState<{ isAuthenticated: boolean; role: 'USER' | 'ADMIN' | null }>({
    isAuthenticated: false,
    role: null,
  });

  useEffect(() => {
    api
      .me()
      .then((me) => setAuth({ isAuthenticated: true, role: me.role }))
      .catch(() => setAuth({ isAuthenticated: false, role: null }));
  }, []);

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-brand-700">
          Hejazi Cosmetics
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
          <Link href="/products">Products</Link>
          <Link href="/cart">Cart</Link>
          {auth.isAuthenticated ? (
            <>
              <Link href="/orders">Orders</Link>
              <Link href="/profile">Profile</Link>
              {auth.role === 'ADMIN' && <Link href="/admin">Admin</Link>}
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
