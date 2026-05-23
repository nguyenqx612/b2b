'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { ProductSellerView } from '@b2b/shared';
import { apiClient, ApiError } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NewProductPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.accessToken;

  const [form, setForm] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    unit: 'unit',
    priceUsdCents: '',
    priceRangeMin: '',
    priceRangeMax: '',
    cbmPerUnit: '',
    weightKg: '',
    hsCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError('');
    try {
      const product = await apiClient.post<ProductSellerView>(
        '/api/products',
        {
          sku: form.sku,
          name: form.name,
          description: form.description || undefined,
          category: form.category,
          unit: form.unit,
          priceUsdCents: Math.round(parseFloat(form.priceUsdCents) * 100),
          priceRangeMin: Math.round(parseFloat(form.priceRangeMin) * 100),
          priceRangeMax: Math.round(parseFloat(form.priceRangeMax) * 100),
          cbmPerUnit: parseFloat(form.cbmPerUnit),
          weightKg: form.weightKg ? parseFloat(form.weightKg) : undefined,
          hsCode: form.hsCode || undefined,
        },
        token,
      );
      router.push(`/seller/catalog/${product.id}/edit`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Add Product" description="Create a new catalog item" />
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" required value={form.sku} onChange={(e) => setField('sku', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={form.name} onChange={(e) => setField('name', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setField('description', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" required value={form.category} onChange={(e) => setField('category', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" required value={form.unit} onChange={(e) => setField('unit', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="price">Unit Price (USD)</Label>
              <Input id="price" type="number" step="0.01" required value={form.priceUsdCents} onChange={(e) => setField('priceUsdCents', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cbm">CBM per unit</Label>
              <Input id="cbm" type="number" step="0.0001" required value={form.cbmPerUnit} onChange={(e) => setField('cbmPerUnit', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="min">Buyer range min (USD)</Label>
              <Input id="min" type="number" step="0.01" required value={form.priceRangeMin} onChange={(e) => setField('priceRangeMin', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="max">Buyer range max (USD)</Label>
              <Input id="max" type="number" step="0.01" required value={form.priceRangeMax} onChange={(e) => setField('priceRangeMax', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" step="0.001" value={form.weightKg} onChange={(e) => setField('weightKg', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="hs">HS Code</Label>
              <Input id="hs" value={form.hsCode} onChange={(e) => setField('hsCode', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={loading || !token}>
                {loading ? 'Creating…' : 'Create Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
