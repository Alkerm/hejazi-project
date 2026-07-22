'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initialProfile, setInitialProfile] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    api
      .profile()
      .then((nextProfile) => {
        setProfile(nextProfile);
        setInitialProfile(nextProfile);
      })
      .catch((e: Error) => setMessage(e.message));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);

    const emailChanged = initialProfile ? profile.email !== initialProfile.email : false;

    try {
      const next = await api.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: emailChanged ? profile.email : undefined,
        phone: profile.phone,
        marketingConsent: profile.marketingConsent,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
        address: profile.defaultAddress ?? undefined,
      });
      setProfile(next);
      setInitialProfile(next);
      setMessage('Profile updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    setLoggingOut(true);
    setMessage(null);

    try {
      await api.logout();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      document.cookie = 'cosmetics_sid_hint=; Max-Age=0; path=/';
      router.push('/');
      router.refresh();
      setLoggingOut(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div className="space-y-1">
        <h1 className="serif-font text-3xl font-bold text-slate-800">Your Profile</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest">Update your details and address settings</p>
      </div>

      <form onSubmit={submit} className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-8">
        {/* Account Info Section */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-bold text-slate-700 border-b border-slate-200/40 pb-2">
            Account Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First Name"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              className="bg-white/80"
            />
            <Input
              label="Last Name"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              className="bg-white/80"
            />
            <Input
              label="Phone Number"
              value={profile.phone ?? ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="bg-white/80"
            />
            <Input
              label="Email Address"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="bg-white/80"
            />
          </div>
        </div>

        {/* Shipping Address Section */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-bold text-slate-700 border-b border-slate-200/40 pb-2">
            Default Delivery Address
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Street Line"
              value={profile.defaultAddress?.line1 ?? ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  defaultAddress: {
                    line1: e.target.value,
                    line2: profile.defaultAddress?.line2 ?? null,
                    city: profile.defaultAddress?.city ?? '',
                    country: profile.defaultAddress?.country ?? '',
                    postalCode: profile.defaultAddress?.postalCode ?? '',
                  },
                })
              }
              className="bg-white/80"
            />
            <Input
              label="City"
              value={profile.defaultAddress?.city ?? ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  defaultAddress: {
                    line1: profile.defaultAddress?.line1 ?? '',
                    line2: profile.defaultAddress?.line2 ?? null,
                    city: e.target.value,
                    country: profile.defaultAddress?.country ?? '',
                    postalCode: profile.defaultAddress?.postalCode ?? '',
                  },
                })
              }
              className="bg-white/80"
            />
            <Input
              label="Country"
              value={profile.defaultAddress?.country ?? ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  defaultAddress: {
                    line1: profile.defaultAddress?.line1 ?? '',
                    line2: profile.defaultAddress?.line2 ?? null,
                    city: profile.defaultAddress?.city ?? '',
                    country: e.target.value,
                    postalCode: profile.defaultAddress?.postalCode ?? '',
                  },
                })
              }
              className="bg-white/80"
            />
            <Input
              label="Postal Code"
              value={profile.defaultAddress?.postalCode ?? ''}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  defaultAddress: {
                    line1: profile.defaultAddress?.line1 ?? '',
                    line2: profile.defaultAddress?.line2 ?? null,
                    city: profile.defaultAddress?.city ?? '',
                    country: profile.defaultAddress?.country ?? '',
                    postalCode: e.target.value,
                  },
                })
              }
              className="bg-white/80"
            />
          </div>
        </div>

        {/* Security Section */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-bold text-slate-700 border-b border-slate-200/40 pb-2">
            Security overrides (Requires password)
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Required to modify email/password"
              className="bg-white/80"
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep same"
              className="bg-white/80"
            />
          </div>
        </div>

        {profile.role === 'USER' && (
          <label className="flex items-start gap-3 text-xs font-semibold text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-slate-200/40">
            <input
              type="checkbox"
              checked={profile.marketingConsent}
              onChange={(e) => setProfile({ ...profile, marketingConsent: e.target.checked })}
              className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
            />
            <span>
              I consent to receive occasional promotional notifications and news from Hejazi Cosmetics.
            </span>
          </label>
        )}

        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200/40">
          <Button type="submit" disabled={saving || loggingOut}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
          <Button type="button" variant="secondary" onClick={logout} disabled={saving || loggingOut} className="border-red-200 text-red-600 hover:bg-red-50/40 hover:border-red-300">
            {loggingOut ? 'Logging out...' : 'Log out'}
          </Button>
        </div>
      </form>

      {message && (
        <div className="rounded-xl bg-amber-50 border border-amber-200/60 p-4 text-xs font-medium text-amber-800">
          {message}
        </div>
      )}
    </div>
  );
}
