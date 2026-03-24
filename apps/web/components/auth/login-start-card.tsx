'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const DEMO_CREDENTIALS = {
  customer: {
    email: 'customer@cosmetics.local',
    password: 'Passw0rd!123',
  },
  admin: {
    email: 'admin@cosmetics.local',
    password: 'Passw0rd!123',
  },
} as const;

export function LoginStartCard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    setIsLocalhost(hostname === 'localhost' || hostname === '127.0.0.1');
  }, []);

  const applyDemoCredentials = (type: keyof typeof DEMO_CREDENTIALS) => {
    setEmail(DEMO_CREDENTIALS[type].email);
    setPassword(DEMO_CREDENTIALS[type].password);
    setMessage(null);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const user = await api.login({ email, password });
      document.cookie = 'cosmetics_sid_hint=1; path=/';
      router.push(user.role === 'ADMIN' ? '/admin' : '/products');
      router.refresh();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Sign in to Hejazi Cosmetics</h1>
      <p className="text-sm text-slate-600">Enter your account details to access the store and dashboard features.</p>
      <div className="rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
        <p className="font-semibold">Demo credentials:</p>
        <p>Customer: {DEMO_CREDENTIALS.customer.email} / {DEMO_CREDENTIALS.customer.password}</p>
        <p>Admin: {DEMO_CREDENTIALS.admin.email} / {DEMO_CREDENTIALS.admin.password}</p>
        {isLocalhost ? (
          <div className="mt-3 flex gap-2">
            <Button type="button" variant="secondary" onClick={() => applyDemoCredentials('customer')}>
              Use customer demo
            </Button>
            <Button type="button" variant="secondary" onClick={() => applyDemoCredentials('admin')}>
              Use admin demo
            </Button>
          </div>
        ) : null}
      </div>

      <form className="space-y-3" onSubmit={onSubmit}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@cosmetics.local"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          required
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {message && <p className="text-sm text-red-600">{message}</p>}

      <p className="text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-brand-700">
          Create account
        </Link>
      </p>
    </div>
  );
}
