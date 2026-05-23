'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.accessToken;

  const [form, setForm] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    unit: '',
    priceUsdCents: '',
    priceRangeMin: '',
    priceRangeMax: '',
    cbmPerUnit: '',
    weightKg: '',
    hsCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    apiClient
      .get<ProductSellerView>(`/api/products/${id}`, token)
      .then((p) =>
        setForm({
          sku: p.sku,
          name: p.name,
          description: p.description ?? '',
          category: p.category,
          unit: p.unit,
          priceUsdCents: (p.priceUsdCents / 100).toFixed(2),
          priceRangeMin: (p.priceRangeMin / 100).toFixed(2),
          priceRangeMax: (p.priceRangeMax / 100).toFixed(2),
          cbmPerUnit: String(p.cbmPerUnit),
          weightKg: p.weightKg != null ? String(p.weightKg) : '',
          hsCode: p.hsCode ?? '',
        }),
      )
      .catch(() => setError('Failed to load product'));
  }, [token, id]);

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      await apiClient.patch(
        `/api/products/${id}`,
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
      router.push('/seller/catalog');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update product');
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      await apiClient.upload(`/api/products/${id}/images`, fd, token);
    } catch {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Edit Product" />
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardContent className="pt-6 space-y-6">
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
            <div className="sm:col-span-2 flex gap-3">
              <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</Button>
              <Button type="button" variant="outline" onClick={() => router.push('/seller/catalog')}>
                Cancel
              </Button>
            </div>
          </form>
          <div>
            <Label htmlFor="image">Product image</Label>
            <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
