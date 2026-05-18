'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BuyerPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to catalog
    router.push('/buyer/catalog');
  }, [router]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Redirecting to catalog...</p>
    </div>
  );
}
