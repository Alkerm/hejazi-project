import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <section className="grid gap-8 md:grid-cols-2 md:items-center">
      <div className="space-y-5">
        <p className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
          Premium Beauty Essentials
        </p>
        <h1 className="text-4xl font-black leading-tight text-slate-900">Elevate your daily beauty routine.</h1>
        <p className="text-slate-600">
          Discover curated skincare, makeup, and fragrance products with secure checkout and reliable order tracking.
        </p>
        <div className="flex gap-3">
          <Link href="/products">
            <Button>Shop Products</Button>
          </Link>
          <Link href="/register">
            <Button variant="secondary">Create Account</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-amber-50 p-8">
        <p className="text-lg font-bold text-brand-800">New arrivals in skincare and makeup</p>
        <p className="mt-2 text-sm text-slate-700">
          Stock-aware cart validation, secure sessions, and performant product search are already live in Phase 1.
        </p>
      </div>
    </section>
  );
}
