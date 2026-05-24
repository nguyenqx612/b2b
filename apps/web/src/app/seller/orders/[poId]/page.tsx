'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { POWorkspace } from '@/components/orders/POWorkspace';

function SellerPOWorkspaceInner() {
  const { poId } = useParams<{ poId: string }>();
  const { data: session } = useSession();
  const token = session?.user?.accessToken;

  if (!token) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <POWorkspace
      role="seller"
      poId={poId}
      token={token}
      backHref="/seller/orders"
    />
  );
}

export default function SellerOrderDetailPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
      <SellerPOWorkspaceInner />
    </Suspense>
  );
}
