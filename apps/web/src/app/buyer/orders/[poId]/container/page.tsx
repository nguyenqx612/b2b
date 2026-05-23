'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { PurchaseOrder } from '@b2b/shared';
import { apiClient, ApiError } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import { POLineItems } from '@/components/orders/POLineItems';
import { Button, buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SimulationResult {
  totalCBM: number;
  containerCBM: number;
  containersNeeded: number;
  utilizationPct: number;
  items: Array<{ name: string; quantity: number; cbmSubtotal: number }>;
}

export default function ContainerSimPage() {
  const { poId } = useParams<{ poId: string }>();
  const { data: session } = useSession();
  const token = session?.user?.accessToken;

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [containerType, setContainerType] = useState('40ft');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiClient.get<PurchaseOrder>(`/api/orders/${poId}`, token).then(setOrder).catch(() => setError('Failed to load order'));
  }, [token, poId]);

  async function runSimulation() {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post<{ simulation: SimulationResult }>(
        `/api/container/${poId}/simulate`,
        { containerType },
        token,
      );
      setResult(res.simulation);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Container Simulation"
        description={order ? order.poNumber : 'Loading…'}
        action={
          <Link href={`/buyer/orders/${poId}`} className={cn(buttonVariants({ variant: 'outline' }))}>
            ← Back to order
          </Link>
        }
      />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {order && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <POLineItems items={order.items} />
          </CardContent>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div className="w-40">
          <Select value={containerType} onValueChange={(v) => v && setContainerType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20ft">20ft</SelectItem>
              <SelectItem value="40ft">40ft</SelectItem>
              <SelectItem value="40ft_hc">40ft HC</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={runSimulation} disabled={loading || !token}>
          {loading ? 'Simulating…' : 'Run Simulation'}
        </Button>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Results</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>Total CBM: <strong>{result.totalCBM.toFixed(3)}</strong></div>
            <div>Container CBM: <strong>{result.containerCBM}</strong></div>
            <div>Containers needed: <strong>{result.containersNeeded}</strong></div>
            <div>Utilization: <strong>{result.utilizationPct.toFixed(1)}%</strong></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
