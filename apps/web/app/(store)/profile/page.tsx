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
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
        address: profile.defaultAddress ?? undefined,
      });
      setProfile(next);
      setInitialProfile(next);
      setMessage('Profile updated');
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

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-bold">Profile</h1>

        <form onSubmit={submit} className="grid gap-3 rounded border bg-white p-5 md:grid-cols-2">
          <Input
            label="First name"
            value={profile.firstName}
            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
          />
          <Input
            label="Last name"
            value={profile.lastName}
            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
          />
          <Input
            label="Phone"
            value={profile.phone ?? ''}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
          <Input
            label="Current password (required to change email/password)"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />
          <Input
            label="New password (optional)"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Leave empty to keep current password"
          />

          <Input
            label="Address line"
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
          />
          <Input
            label="Postal code"
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
          />

          <div className="col-span-full flex gap-3">
            <Button type="submit" disabled={saving || loggingOut}>
              {saving ? 'Saving...' : 'Save profile'}
            </Button>
            <Button type="button" variant="secondary" onClick={logout} disabled={saving || loggingOut}>
              {loggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </form>

        {message && <p className="text-sm text-slate-700">{message}</p>}
      </div>
    </div>
  );
}
