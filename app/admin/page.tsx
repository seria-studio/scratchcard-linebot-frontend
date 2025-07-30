'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // This page should no longer be accessed directly since the root page handles all redirects
    // Redirect to admin scratch cards page directly
    router.replace('/admin/scratch-cards');
  }, [router]);

  return null;
}