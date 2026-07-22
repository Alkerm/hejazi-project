'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);

    try {
      const res = await api.forgotPassword(email.trim());
      toast.success('Reset link generated!');
      if (res.token) {
        setResetToken(res.token);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to request password reset');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in max-w-md mx-auto space-y-6">
      <Toaster position="top-right" richColors />

      <div className="glass-card rounded-2xl p-8 border border-slate-200/40 w-full space-y-6 text-center">
        <div className="p-3 bg-amber-50 rounded-2xl inline-block text-amber-600 border border-amber-200/60">
          <KeyRound className="w-8 h-8 mx-auto" />
        </div>

        <div className="space-y-1">
          <h1 className="serif-font text-2xl font-bold text-slate-800">Forgot Password?</h1>
          <p className="text-xs text-slate-500">Enter your registered email address to recover your account</p>
        </div>

        {resetToken ? (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-left text-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Reset Instructions Generated
            </div>
            <p className="text-slate-600 leading-relaxed">
              [Local Testing Simulation]: Click the link below to set your new password:
            </p>
            <Link
              href={`/reset-password?token=${resetToken}`}
              className="inline-flex items-center gap-1 font-bold text-emerald-700 underline text-xs"
            >
              Reset Password Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. customer@example.com"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-slate-900 text-white text-xs py-3">
              {submitting ? 'Sending Instructions...' : 'Send Reset Instructions'}
            </Button>
          </form>
        )}

        <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
          Remember your password?{' '}
          <Link href="/login" className="font-bold text-brand-600 hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
