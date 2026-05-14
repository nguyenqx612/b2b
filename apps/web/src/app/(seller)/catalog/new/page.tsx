'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function NewProductPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken as string;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const body = {
      sku: fd.get('sku'),
      name: fd.get('name'),
      description: fd.get('description'),
      category: fd.get('category'),
      unit: fd.get('unit'),
      priceUsdCents: Math.round(Number(fd.get('priceUsd')) * 100),
      priceRangeMin: Math.round(Number(fd.get('priceRangeMin')) * 100),
      priceRangeMax: Math.round(Number(fd.get('priceRangeMax')) * 100),
      cbmPerUnit: Number(fd.get('cbmPerUnit')),
      hsCode: fd.get('hsCode') || undefined,
      originCountry: 'VN',
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Failed to create product');
      setLoading(false);
      return;
    }

    router.push('/seller/catalog');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/seller/catalog" className="text-sm text-gray-500 hover:text-gray-700">← Back to catalog</Link>
      <h1 className="mt-1 mb-6 text-2xl font-bold">Add Product</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Product Name *" name="name" required />
          <Field label="SKU *" name="sku" required />
          <Field label="Category *" name="category" required />
          <Field label="Unit *" name="unit" placeholder="e.g. carton, piece, kg" required />
        </div>

        <Field label="Description" name="description" textarea />

        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Pricing</p>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Exact Unit Price (USD) *" name="priceUsd" type="number" step="0.01" required helpText="Visible to seller only" />
            <Field label="Buyer Range Min (USD) *" name="priceRangeMin" type="number" step="0.01" required helpText="Shown to buyers" />
            <Field label="Buyer Range Max (USD) *" name="priceRangeMax" type="number" step="0.01" required />
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Dimensions</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="CBM per Unit *" name="cbmPerUnit" type="number" step="0.0001" required helpText="Cubic meters per unit" />
            <Field label="HS Code" name="hsCode" placeholder="e.g. 0901.21" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit" disabled={loading}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {loading ? 'Saving…' : 'Save Product'}
          </button>
          <Link href="/seller/catalog" className="rounded-md border px-6 py-2 text-sm font-medium hover:bg-gray-50 transition">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label, name, type = 'text', required = false, placeholder, textarea = false,
  step, helpText,
}: {
  label: string; name: string; type?: string; required?: boolean;
  placeholder?: string; textarea?: boolean; step?: string; helpText?: string;
}) {
  const cls = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {textarea
        ? <textarea name={name} rows={3} className={cls} placeholder={placeholder} />
        : <input name={name} type={type} required={required} step={step} placeholder={placeholder} className={cls} />
      }
      {helpText && <p className="mt-1 text-xs text-gray-400">{helpText}</p>}
    </div>
  );
}
