'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { ProductSellerView } from '@b2b/shared';
import { formatCents, formatCentsRange } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type ListingFilter = 'all' | 'listed' | 'hidden';

export function SellerCatalogClient() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;

  const [products, setProducts] = useState<ProductSellerView[]>([]);
  const [listing, setListing] = useState<ListingFilter>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importUrl, setImportUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');

  const loadProducts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const qs = listing !== 'all' ? `?listing=${listing}&pageSize=100` : '?pageSize=100';
    const res = await fetch(`${API}/api/products${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProducts(data.items ?? []);
    setSelected(new Set());
    setLoading(false);
  }, [token, listing]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function runImport(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setImporting(true);
    setMessage('');
    const res = await fetch(`${API}/api/products/import-from-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(importUrl ? { url: importUrl } : {}),
    });
    setImporting(false);
    if (res.ok) {
      const data = await res.json();
      setMessage(`Imported ${data.imported} new, updated ${data.updated} (${data.total} found). New items are hidden until you activate them.`);
      loadProducts();
    } else {
      const err = await res.json();
      setMessage(err.error ?? 'Import failed');
    }
  }

  async function bulkActive(isActive: boolean) {
    if (!token || selected.size === 0) return;
    await fetch(`${API}/api/products/bulk-active`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ productIds: [...selected], isActive }),
    });
    loadProducts();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Link
          href="/seller/catalog/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          + Add Product
        </Link>
      </div>

      <form onSubmit={runImport} className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="font-semibold text-sm">Import from website</h2>
        <p className="text-xs text-muted-foreground">
          Scrape products from your catalog URL. New imports are hidden until you activate them.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            type="url"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="https://tamlongcraft.com/"
            className="min-w-[280px] flex-1 rounded-md border border-border px-3 py-2 text-sm"
          />
          <Button type="submit" disabled={importing}>
            {importing ? 'Importing…' : 'Run import'}
          </Button>
        </div>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'listed', 'hidden'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setListing(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              listing === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {f === 'all' ? 'All' : f === 'listed' ? 'Listed' : 'Hidden'}
          </button>
        ))}
        {selected.size > 0 && (
          <>
            <Button size="sm" onClick={() => bulkActive(true)}>Activate selected</Button>
            <Button size="sm" variant="outline" onClick={() => bulkActive(false)}>Hide selected</Button>
          </>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : products.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground">
          <p>No products in this view.</p>
          <Link href="/seller/catalog/new" className="mt-2 inline-block text-primary hover:underline text-sm">
            Add your first product →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selected.size === products.length} onChange={toggleAll} />
                </th>
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-left font-medium">SKU</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Unit Price</th>
                <th className="px-4 py-3 text-right font-medium">Buyer Range</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} />
                  </td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCents(p.priceUsdCents)}</td>
                  <td className="px-4 py-3 text-right text-primary">{formatCentsRange(p.priceRangeMin, p.priceRangeMax)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {p.isActive ? 'Listed' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/seller/catalog/${p.id}/edit`} className="text-primary hover:underline text-xs">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
