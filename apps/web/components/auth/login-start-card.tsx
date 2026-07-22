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
    <div className="mx-auto max-w-md space-y-6 glass-card rounded-2xl p-8 border border-slate-200/40 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="serif-font text-3xl font-bold text-slate-800">Welcome Back</h1>
        <p className="text-xs uppercase tracking-widest text-luxury-gold font-medium">Hejazi Cosmetics Portal</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Demo Login</p>
        <div className="text-[10px] text-slate-500 space-y-1">
          <p><span className="font-semibold text-slate-700">Customer:</span> {DEMO_CREDENTIALS.customer.email}</p>
          <p><span className="font-semibold text-slate-700">Admin:</span> {DEMO_CREDENTIALS.admin.email}</p>
        </div>
        {isLocalhost && (
          <div className="mt-3 flex gap-2">
            <button 
              type="button" 
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 active:scale-95 transition"
              onClick={() => applyDemoCredentials('customer')}
            >
              Customer Log
            </button>
            <button 
              type="button" 
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 active:scale-95 transition"
              onClick={() => applyDemoCredentials('admin')}
            >
              Admin Log
            </button>
          </div>
        )}
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@cosmetics.local"
          required
          className="bg-white/80"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your account password"
          required
          className="bg-white/80"
        />
        
        {message && (
          <p className="text-xs font-semibold text-red-500">{message}</p>
        )}

        <Button type="submit" disabled={loading} className="w-full py-3">
          {loading ? 'Verifying...' : 'Sign in'}
        </Button>
      </form>

      <div className="border-t border-slate-200/50 pt-4 text-center">
        <p className="text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700 transition">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
