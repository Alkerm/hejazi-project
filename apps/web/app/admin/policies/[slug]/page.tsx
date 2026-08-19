'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PolicyEditor } from '@/components/admin/policy-editor';

export default function AdminPolicySlugPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug || 'terms';

  return <PolicyEditor currentSlug={slug} />;
}
