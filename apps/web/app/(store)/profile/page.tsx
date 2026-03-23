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
  const [message, setMessage] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    api
      .profile()
      .then(setProfile)
      .catch((e: Error) => setMessage(e.message));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;

    try {
      const next = await api.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
        address: profile.defaultAddress ?? undefined,
      });
      setProfile(next);
      setMessage('Profile updated');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e) {
      setMessage((e as Error).message);
    }
  };

  const logout = async () => {
    await api.logout();
    router.push('/');
    router.refresh();
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
            <Button type="submit">Save profile</Button>
            <Button type="button" variant="secondary" onClick={logout}>
              Logout
            </Button>
          </div>
        </form>

        {message && <p className="text-sm text-slate-700">{message}</p>}
      </div>
    </div>
  );
}
