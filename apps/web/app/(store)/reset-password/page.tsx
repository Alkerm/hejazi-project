'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid password reset link.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      await api.resetPassword({ token, newPassword });
      toast.success('Password reset successfully! You can now log in.');
      setSuccess(true);
    } catch (err: any) {
      toast.error(err.message || 'Password reset failed. Token may be expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in max-w-md mx-auto space-y-6">
      <Toaster position="top-right" richColors />

      <div className="glass-card rounded-2xl p-8 border border-slate-200/40 w-full space-y-6 text-center">
        <div className="p-3 bg-cyan-50 rounded-2xl inline-block text-cyan-600 border border-cyan-200/60">
          <ShieldCheck className="w-8 h-8 mx-auto" />
        </div>

        <div className="space-y-1">
          <h1 className="serif-font text-2xl font-bold text-slate-800">Set New Password</h1>
          <p className="text-xs text-slate-500">Create a secure new password for your account</p>
        </div>

        {success ? (
          <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-xl text-center text-xs space-y-3">
            <CheckCircle2 className="w-8 h-8 text-cyan-600 mx-auto" />
            <p className="text-cyan-800 font-bold text-sm">Password Updated!</p>
            <p className="text-slate-600">Your account password has been changed successfully.</p>
            <Link href="/login" className="inline-block pt-2">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20">Proceed to Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">New Password:</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Confirm New Password:</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <Button type="submit" disabled={submitting || !token} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs py-3 shadow-md shadow-cyan-600/20">
              {submitting ? 'Updating Password...' : 'Save New Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
