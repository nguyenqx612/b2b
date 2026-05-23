'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { ProductBuyerView, PurchaseOrder } from '@b2b/shared';
import { apiClient, ApiError } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NewOrderPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sellerId = searchParams.get('sellerId') ?? '';
  const { data: session } = useSession();
  const token = session?.user?.accessToken;

  const [products, setProducts] = useState<ProductBuyerView[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [shippingTerms, setShippingTerms] = useState('FOB');
  const [portOfLoading, setPortOfLoading] = useState('Ho Chi Minh City');
  const [portOfDischarge, setPortOfDischarge] = useState('Los Angeles');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (!token) return;
    const qs = sellerId ? `?sellerId=${sellerId}&pageSize=100` : '?pageSize=100';
    apiClient
      .get<{ items: ProductBuyerView[] }>(`/api/products${qs}`, token)
      .then((res) => setProducts(res.items))
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoadingProducts(false));
  }, [token, sellerId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    const items = products
      .filter((p) => (quantities[p.id] ?? 0) > 0)
      .map((p) => ({ productId: p.id, quantity: quantities[p.id] }));

    if (items.length === 0) {
      setError('Add at least one product with quantity > 0');
      return;
    }

    const resolvedSellerId = sellerId || products[0]?.sellerId;
    if (!resolvedSellerId) {
      setError('Select products from a seller');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const order = await apiClient.post<PurchaseOrder>(
        '/api/orders',
        {
          sellerId: resolvedSellerId,
          items,
          notes: notes || undefined,
          shippingTerms: shippingTerms || undefined,
          portOfLoading: portOfLoading || undefined,
          portOfDischarge: portOfDischarge || undefined,
        },
        token,
      );
      router.push(`/buyer/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  }

  if (loadingProducts) {
    return <p className="text-muted-foreground">Loading products…</p>;
  }

  return (
    <div>
      <PageHeader title="Create Purchase Order" description="Select products and shipping details" />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Line Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products available.</p>
            ) : (
              products.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 border-b pb-3 last:border-0">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.seller.companyName}</div>
                  </div>
                  <div className="w-24">
                    <Label htmlFor={`qty-${p.id}`} className="sr-only">
                      Quantity
                    </Label>
                    <Input
                      id={`qty-${p.id}`}
                      type="number"
                      min={0}
                      placeholder="0"
                      value={quantities[p.id] ?? ''}
                      onChange={(e) =>
                        setQuantities((prev) => ({
                          ...prev,
                          [p.id]: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipping</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="terms">Shipping Terms</Label>
              <Input id="terms" value={shippingTerms} onChange={(e) => setShippingTerms(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pol">Port of Loading</Label>
              <Input id="pol" value={portOfLoading} onChange={(e) => setPortOfLoading(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pod">Port of Discharge</Label>
              <Input id="pod" value={portOfDischarge} onChange={(e) => setPortOfDischarge(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading || !token}>
          {loading ? 'Creating…' : 'Create Draft Order'}
        </Button>
      </form>
    </div>
  );
}
