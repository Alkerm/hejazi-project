'use client';

import { ReactNode, useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api
      .me()
      .then((me) => {
        if (me.role !== 'ADMIN') {
          window.location.href = '/';
          return;
        }
        setReady(true);
      })
      .catch(() => {
        window.location.href = '/';
      });
  }, []);

  if (!ready) return <p>Loading admin...</p>;

  return <div className="space-y-6">{children}</div>;
}
