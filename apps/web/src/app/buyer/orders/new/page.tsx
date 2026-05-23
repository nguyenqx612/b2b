import { Suspense } from 'react';
import NewOrderPageClient from './NewOrderClient';

export default function NewOrderPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
      <NewOrderPageClient />
    </Suspense>
  );
}
