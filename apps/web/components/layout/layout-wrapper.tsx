'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/store/navbar';
import { Footer } from '@/components/store/footer';
import { AmbientBackground } from '@/components/ui/ambient-background';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = Boolean(pathname && pathname.startsWith('/admin'));

  if (isAdmin) {
    return <div className="min-h-screen bg-slate-50 text-slate-900">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/30 text-slate-900">
      <AmbientBackground />
      <Navbar />
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 pt-3 pb-8 sm:pt-4 sm:pb-12">{children}</main>
      <Footer />
    </div>
  );
}
