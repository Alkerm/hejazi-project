'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  Boxes,
  Star,
  Ticket,
  Headphones,
  BarChart3,
  History,
  Store,
  LogOut,
  User,
  Users,
  Megaphone,
  Wallet,
  Globe,
  X,
  ShieldAlert,
  ScrollText,
  ShieldCheck,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { UserProfile } from '@/lib/types';
import { api } from '@/lib/api';

interface AdminSidebarProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ user, isOpen, onClose }: AdminSidebarProps) {
  const rawPathname = usePathname();
  const currentPath = rawPathname || '';
  const { lang, toggleLanguage, t } = useLanguage();

  const clearAuthHintCookie = () => {
    document.cookie = 'cosmetics_sid_hint=; Max-Age=0; path=/';
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } finally {
      clearAuthHintCookie();
      window.location.href = '/';
    }
  };

  const navSections = [
    {
      title: t('Overview', 'نظرة عامة'),
      items: [
        { href: '/admin', label: t('Dashboard', 'لوحة التحكم'), icon: LayoutDashboard },
        { href: '/admin/financials', label: t('Financial Wallet', 'محفظة مالية'), icon: Wallet },
        { href: '/admin/analytics', label: t('Analytics', 'التحليلات'), icon: BarChart3 },
        { href: '/admin/audit-logs', label: t('Audit Logs', 'سجل العمليات'), icon: History },
      ],
    },
    {
      title: t('Management', 'الإدارة'),
      items: [
        { href: '/admin/products', label: t('Products', 'المنتجات'), icon: Package },
        { href: '/admin/orders', label: t('Orders', 'الطلبات'), icon: ShoppingBag },
        { href: '/admin/customers', label: t('Customers & Announcements', 'العملاء والرسائل العامة'), icon: Users },
        { href: '/admin/drivers', label: t('Drivers & Deliveries', 'إدارة السائقين والشحنات'), icon: Truck },
        { href: '/driver', label: t('Driver Portal', 'بوابة السائقين'), icon: Truck },
        { href: '/admin/inventory', label: t('Inventory', 'المخزون'), icon: Boxes },
      ],
    },
    {
      title: t('Store Policies & Content', 'سياسات المتجر والمحتوى'),
      items: [
        { href: '/admin/policies', label: t('Store Policies & Legal', 'سياسات المتجر والوثائق'), icon: ScrollText },
      ],
    },
    {
      title: t('Engagement', 'خدمة العملاء والخصومات'),
      items: [
        { href: '/admin/reviews', label: t('Reviews', 'التقييمات'), icon: Star },
        { href: '/admin/coupons', label: t('Coupons', 'كوبونات الخصم'), icon: Ticket },
        { href: '/admin/support', label: t('Support Tickets', 'تذاكر الدعم'), icon: Headphones },
      ],
    },
    {
      title: t('Storefront', 'المتجر'),
      items: [
        { href: '/products', label: t('View Store', 'عرض المتجر'), icon: Store },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return currentPath === '/admin';
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  const adminName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User'
    : 'Admin User';
  const adminEmail = user?.email || 'admin@halflink.sa';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 z-50 flex w-72 flex-col justify-between bg-slate-900 text-white shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          lang === 'ar' ? 'right-0' : 'left-0'
        } ${
          isOpen
            ? 'translate-x-0'
            : lang === 'ar'
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Admin Profile Details */}
          <div className="border-b border-slate-800/80 px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/30 shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-100">{adminName}</p>
                  <p className="truncate text-[11px] text-slate-400">{adminEmail}</p>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-400/20 uppercase tracking-wider">
                    <ShieldAlert className="w-2.5 h-2.5" />
                    {t('Administrator', 'مشرف')}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-6 px-4 py-2">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1.5">
                <h3 className="px-3 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                          active
                            ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/30 shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                            active ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span className="flex-1">{item.label}</span>
                        {active && (
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Actions (Language Switcher & Logout) */}
        <div className="border-t border-slate-800/80 p-4 space-y-2">
          <button
            onClick={toggleLanguage}
            className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-850 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" />
              {t('Language', 'اللغة')}
            </span>
            <span className="text-[10px] font-bold text-amber-400 uppercase">
              {lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>{t('Logout', 'تسجيل الخروج')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
