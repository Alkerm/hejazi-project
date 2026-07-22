import Link from 'next/link';
import { policyLinks, storefrontSettings } from '@/lib/storefront';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200/60 bg-white/50 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="serif-font text-xl font-bold tracking-wider text-slate-800">
              Hejazi
            </span>
            <span className="text-[10px] tracking-[0.2em] font-semibold text-luxury-gold uppercase border-l border-slate-300 pl-2">
              Cosmetics
            </span>
          </div>
          <p className="max-w-md text-xs text-slate-500 leading-relaxed">
            Elevating your beauty ritual with premium ingredients, SFDA-compliant formulations, and the spirit of heritage. 
          </p>
          <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2 pt-2">
            <p>
              <span className="font-semibold text-slate-800">Entity:</span> {storefrontSettings.storeName}
            </p>
            <p>
              <span className="font-semibold text-slate-800">CR No:</span> {storefrontSettings.crNumber}
            </p>
            <p>
              <span className="font-semibold text-slate-800">Email:</span> {storefrontSettings.email}
            </p>
            <p>
              <span className="font-semibold text-slate-800">Phone:</span> {storefrontSettings.phone}
            </p>
            <p className="sm:col-span-2">
              <span className="font-semibold text-slate-800">Address:</span> {storefrontSettings.address}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-bold text-slate-800">Store Policies</h2>
          <nav className="grid gap-2 sm:grid-cols-2 text-xs">
            {policyLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-slate-500 hover:text-brand-500 transition-colors duration-200">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="border-t border-slate-200/40 py-6 text-center text-[10px] text-slate-400">
        © {new Date().getFullYear()} Hejazi Cosmetics. All rights reserved.
      </div>
    </footer>
  );
}
