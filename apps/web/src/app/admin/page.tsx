'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to users page
    router.push('/admin/users');
  }, [router]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Redirecting to admin dashboard...</p>
    </div>
  );
}
