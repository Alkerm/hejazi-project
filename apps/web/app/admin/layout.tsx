'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { api } from '@/lib/api';
import { UserProfile } from '@/lib/types';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { useLanguage } from '@/lib/language-context';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const rawPathname = usePathname();
  const currentPath = rawPathname || '';
  const { lang, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    api
      .me()
      .then((me) => {
        if (me.role !== 'ADMIN') {
          window.location.href = '/';
          return;
        }
        setUser(me);
        setReady(true);
      })
      .catch(() => {
        window.location.href = '/';
      });
  }, []);

  const getPageTitle = (path: string) => {
    if (!path || path === '/admin') return t('Dashboard Overview', 'نظرة عامة على لوحة التحكم');
    if (path.startsWith('/admin/financials')) return t('Financial Wallet & Profit Analysis', 'المحفظة المالية وتحليلات الأرباح');
    if (path.startsWith('/admin/policies')) return t('Store Policies & Legal Management', 'إدارة سياسات المتجر والمحتوى القانوني');
    if (path.startsWith('/admin/products')) return t('Products Management', 'إدارة المنتجات');
    if (path.startsWith('/admin/orders')) return t('Orders Management', 'إدارة الطلبات');
    if (path.startsWith('/admin/customers')) return t('Customer Base & Broadcast Announcements', 'قاعدة العملاء والرسائل الجماعية');
    if (path.startsWith('/admin/drivers')) return t('Driver & Delivery Operations', 'إدارة السائقين وتوزيع الشحنات');
    if (path.startsWith('/admin/inventory')) return t('Inventory & Low Stock', 'إدارة المخزون والتنبيهات');
    if (path.startsWith('/admin/reviews')) return t('Reviews Moderation', 'إدارة التقييمات');
    if (path.startsWith('/admin/coupons')) return t('Discount Coupons', 'كوبونات الخصم');
    if (path.startsWith('/admin/support')) return t('Support Tickets', 'تذاكر الدعم الفني');
    if (path.startsWith('/admin/analytics')) return t('Sales Analytics', 'تحليلات المبيعات');
    if (path.startsWith('/admin/audit-logs')) return t('Audit Logs', 'سجل العمليات الإدارية');
    return t('Admin Workspace', 'مساحة الإدارة');
  };

  if (!ready) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center space-y-4 bg-slate-900 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-amber-400"></div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 animate-pulse">
          {t('Loading Admin Workspace...', 'جاري تحميل لوحة التحكم الإدارية...')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100/70 text-slate-900">
      {/* Admin Sidebar */}
      <AdminSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Administrative Work Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden transition"
              aria-label="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <h1 className="text-base font-bold text-slate-800 tracking-tight">
                {getPageTitle(currentPath)}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Top header clean empty actions container */}
          </div>
        </header>

        {/* Page Body Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
