import { Suspense } from 'react';
import { getSessionToken } from '@/lib/session';
import { POWorkspace } from '@/components/orders/POWorkspace';

interface Props {
  params: Promise<{ poId: string }>;
}

export default async function BuyerOrderDetailPage({ params }: Props) {
  const { poId } = await params;
  const token = await getSessionToken();

  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
      <POWorkspace
        role="buyer"
        poId={poId}
        token={token}
        backHref="/buyer/orders"
      />
    </Suspense>
  );
}
