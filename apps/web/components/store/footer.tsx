import Link from 'next/link';
import { policyLinks, storefrontSettings } from '@/lib/storefront';

export function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Store Information</h2>
          <div className="space-y-1 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">Legal name:</span> {storefrontSettings.storeName}
            </p>
            <p>
              <span className="font-semibold text-slate-900">CR number:</span> {storefrontSettings.crNumber}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Email:</span> {storefrontSettings.email}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Phone:</span> {storefrontSettings.phone}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Address:</span> {storefrontSettings.address}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Policies</h2>
          <nav className="flex flex-col gap-2 text-sm text-slate-600">
            {policyLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-brand-700">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
