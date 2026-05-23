import Link from 'next/link';
import { getSessionToken } from '@/lib/session';
import { apiClient, ApiError } from '@/lib/api-client';
import type { PurchaseOrder } from '@b2b/shared';
import { PageHeader } from '@/components/layout/PageHeader';
import { POStatusBadge } from '@/components/orders/POStatusBadge';
import { POLineItems } from '@/components/orders/POLineItems';
import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const token = await getSessionToken();

  let order: PurchaseOrder | null = null;
  let error = '';

  try {
    order = await apiClient.get<PurchaseOrder>(`/api/orders/${id}`, token);
  } catch (err) {
    error = err instanceof ApiError ? err.message : 'Failed to load order';
  }

  if (error || !order) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || 'Order not found'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <PageHeader
        title={order.poNumber}
        description="Read-only admin view"
        action={
          <div className="flex gap-2">
            <Link href="/admin/orders" className={cn(buttonVariants({ variant: 'outline' }))}>
              ← All orders
            </Link>
            <Link href="/admin/audit" className={cn(buttonVariants({ variant: 'outline' }))}>
              Audit log
            </Link>
          </div>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <POStatusBadge status={order.status} />
        <span className="text-sm text-muted-foreground">Version {order.currentVersion}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Participants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Buyer: </span>
              {order.buyer?.companyName ?? order.buyer?.email ?? order.buyerId}
            </div>
            <div>
              <span className="text-muted-foreground">Seller: </span>
              {order.seller?.companyName ?? order.seller?.email ?? order.sellerId}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div>Terms: {order.shippingTerms ?? '—'}</div>
            <div>POL: {order.portOfLoading ?? '—'}</div>
            <div>POD: {order.portOfDischarge ?? '—'}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <POLineItems items={order.items} />
        </CardContent>
      </Card>
    </div>
  );
}
