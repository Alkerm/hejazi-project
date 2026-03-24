'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { UserProfile } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CartAddressPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    country: '',
    postalCode: '',
  });

  useEffect(() => {
    api
      .profile()
      .then((nextProfile) => {
        setProfile(nextProfile);
        if (nextProfile.defaultAddress) {
          setAddress({
            line1: nextProfile.defaultAddress.line1,
            line2: nextProfile.defaultAddress.line2 ?? '',
            city: nextProfile.defaultAddress.city,
            country: nextProfile.defaultAddress.country,
            postalCode: nextProfile.defaultAddress.postalCode,
          });
        }
      })
      .catch((e: Error) => setMessage(e.message));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    try {
      await api.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        marketingConsent: profile.marketingConsent,
        address: {
          line1: address.line1,
          line2: address.line2 || undefined,
          city: address.city,
          country: address.country,
          postalCode: address.postalCode,
        },
      });
      router.push('/cart');
      router.refresh();
    } catch (e) {
      setMessage((e as Error).message);
      setSaving(false);
    }
  };

  if (!profile) return <p>{message ?? 'Loading address form...'}</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Shipping Address</h1>
          <p className="text-sm text-slate-600">Save your delivery address and return to the cart.</p>
        </div>
        <Button type="button" variant="secondary" onClick={() => router.push('/cart')}>
          Back to cart
        </Button>
      </div>

      <form onSubmit={submit} className="grid gap-3 rounded border bg-white p-5 md:grid-cols-2">
        <Input
          label="Address line 1"
          value={address.line1}
          onChange={(e) => setAddress({ ...address, line1: e.target.value })}
          required
        />
        <Input
          label="Address line 2"
          value={address.line2}
          onChange={(e) => setAddress({ ...address, line2: e.target.value })}
        />
        <Input
          label="City"
          value={address.city}
          onChange={(e) => setAddress({ ...address, city: e.target.value })}
          required
        />
        <Input
          label="Country"
          value={address.country}
          onChange={(e) => setAddress({ ...address, country: e.target.value })}
          required
        />
        <Input
          label="Postal code"
          value={address.postalCode}
          onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
          required
        />

        <div className="col-span-full flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save address'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push('/cart')} disabled={saving}>
            Cancel
          </Button>
        </div>
      </form>

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </div>
  );
}
