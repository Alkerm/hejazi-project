'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/inventory', label: 'Inventory' },
  { href: '/admin/analytics', label: 'Analytics' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api
      .me()
      .then((me) => {
        if (me.role !== 'ADMIN') {
          router.replace('/login');
          return;
        }
        setReady(true);
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  const logout = async () => {
    await api.logout();
    router.replace('/login');
  };

  if (!ready) return <p>Loading admin...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <div className="flex items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded px-3 py-2 text-sm font-semibold ${pathname === link.href ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              {link.label}
            </Link>
          ))}
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      {children}
    </div>
  );
}
