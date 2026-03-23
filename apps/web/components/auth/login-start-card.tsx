'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function LoginStartCard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        <p>Customer: customer@cosmetics.local / Passw0rd!123</p>
        <p>Admin: admin@cosmetics.local / Passw0rd!123</p>
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
