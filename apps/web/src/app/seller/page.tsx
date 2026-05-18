'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SellerPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to catalog
    router.push('/seller/catalog');
  }, [router]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Redirecting to catalog...</p>
    </div>
  );
}
