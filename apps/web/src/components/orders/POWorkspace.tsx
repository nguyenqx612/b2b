'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { POItem, POVersion, PurchaseOrder, Role } from '@b2b/shared';
import { POStatusBadge } from '@/components/orders/POStatusBadge';
import { POVersionHistory } from '@/components/orders/POVersionHistory';
import { MessageThread } from '@/components/messaging/MessageThread';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const DOC_TYPES = [
  { value: 'co_form_b', label: 'C/O Form B' },
  { value: 'commercial_invoice', label: 'Commercial Invoice' },
  { value: 'packing_list', label: 'Packing List' },
  { value: 'proforma_invoice', label: 'Proforma Invoice' },
  { value: 'bill_of_lading', label: 'Bill of Lading' },
] as const;

const SELLER_TRANSITIONS: Record<string, string[]> = {
  submitted: ['acknowledged', 'cancelled'],
  acknowledged: ['confirmed', 'cancelled'],
  confirmed: ['in_production', 'cancelled'],
  in_production: ['ready_to_ship'],
  ready_to_ship: ['shipped'],
  shipped: ['delivered'],
};

const BUYER_TRANSITIONS: Record<string, string[]> = {
  draft: ['submitted', 'cancelled'],
};

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submit order',
  acknowledged: 'Acknowledge',
  confirmed: 'Confirm',
  in_production: 'Mark In Production',
  ready_to_ship: 'Mark Ready to Ship',
  shipped: 'Mark Shipped',
  delivered: 'Mark Delivered',
  cancelled: 'Cancel Order',
};

function usd(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

interface OrderMessage {
  id: string;
  senderId: string;
  messageType: 'text' | 'file' | 'system';
  body: string | null;
  fileName: string | null;
  fileS3Key: string | null;
  sender: { email: string; companyName: string | null; role: string };
  createdAt: string;
}

interface POWorkspaceProps {
  role: Role;
  poId: string;
  token: string;
  backHref: string;
}

export function POWorkspace({ role, poId, token, backHref }: POWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') ?? 'overview';

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [versions, setVersions] = useState<POVersion[]>([]);
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [cost, setCost] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [shippers, setShippers] = useState<any[]>([]);
  const [containerResult, setContainerResult] = useState<any>(null);
  const [containerType, setContainerType] = useState('40ft');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusBusy, setStatusBusy] = useState(false);
  const [genBusy, setGenBusy] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<Record<string, number>>({});
  const [itemsSaving, setItemsSaving] = useState(false);
  const [showCostForm, setShowCostForm] = useState(false);
  const [costSaving, setCostSaving] = useState(false);

  const authHeader = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    try {
      const [orderRes, versionsRes, msgRes, costRes, docsRes, quotesRes, shippersRes] = await Promise.all([
        fetch(`${API}/api/orders/${poId}`, { headers: authHeader }),
        fetch(`${API}/api/orders/${poId}/versions`, { headers: authHeader }),
        fetch(`${API}/api/messages/${poId}`, { headers: authHeader }),
        fetch(`${API}/api/costs/${poId}`, { headers: authHeader }),
        fetch(`${API}/api/documents/${poId}`, { headers: authHeader }),
        fetch(`${API}/api/freight/po/${poId}`, { headers: authHeader }),
        role !== 'shipper' ? fetch(`${API}/api/freight/shippers`, { headers: authHeader }) : Promise.resolve(null),
      ]);
      const o = await orderRes.json();
      setOrder(o);
      setVersions(await versionsRes.json());
      setMessages(await msgRes.json());
      setCost(await costRes.json());
      setDocs(await docsRes.json());
      setQuotes((await quotesRes.json()).items ?? []);
      if (shippersRes) setShippers((await shippersRes.json()).items ?? []);
      const qtyMap: Record<string, number> = {};
      (o.items ?? []).forEach((item: POItem) => { qtyMap[item.productId] = item.quantity; });
      setEditQty(qtyMap);
    } catch {
      setError('Failed to load order.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poId, token, role]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function advanceStatus(newStatus: string) {
    setStatusBusy(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/orders/${poId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      setOrder(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setStatusBusy(false);
    }
  }

  async function saveItems() {
    if (!order) return;
    setItemsSaving(true);
    setError('');
    try {
      const items = order.items.map((item) => ({
        productId: item.productId,
        quantity: editQty[item.productId] ?? item.quantity,
      }));
      const res = await fetch(`${API}/api/orders/${poId}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      setOrder(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setItemsSaving(false);
    }
  }

  async function generateDoc(docType: string) {
    setGenBusy(docType);
    try {
      const res = await fetch(`${API}/api/documents/${poId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ docType }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank');
      fetchAll();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenBusy(null);
    }
  }

  async function requestQuote(shipperId: string) {
    await fetch(`${API}/api/freight/po/${poId}/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ shipperId }),
    });
    fetchAll();
  }

  async function acceptQuote(quoteId: string) {
    await fetch(`${API}/api/freight/po/${poId}/quotes/${quoteId}/accept`, {
      method: 'POST',
      headers: authHeader,
    });
    fetchAll();
  }

  async function runContainerSim() {
    const res = await fetch(`${API}/api/container/${poId}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ containerType }),
    });
    const data = await res.json();
    setContainerResult(data.simulation);
  }

  async function saveCost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCostSaving(true);
    const fd = new FormData(e.currentTarget);
    const toCents = (key: string) => Math.round(parseFloat((fd.get(key) as string) || '0') * 100);
    try {
      const res = await fetch(`${API}/api/costs/${poId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          goodsFobCents: toCents('goodsFob'),
          freightCents: toCents('freight'),
          insuranceCents: toCents('insurance'),
          customsDutyCents: toCents('customsDuty'),
          portHandlingCents: toCents('portHandling'),
          otherCents: toCents('other'),
          notes: (fd.get('notes') as string) || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      setCost(await res.json());
      setShowCostForm(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCostSaving(false);
    }
  }

  if (loading) return <p className="text-muted-foreground py-12 text-center">Loading order…</p>;
  if (!order || (order as any).error) {
    return <p className="text-destructive">{ (order as any)?.error ?? 'Order not found.' }</p>;
  }

  const transitions =
    role === 'seller' ? (SELLER_TRANSITIONS[order.status] ?? []) :
    role === 'buyer' ? (BUYER_TRANSITIONS[order.status] ?? []) : [];

  const canEditItems =
    (role === 'buyer' && ['draft', 'submitted'].includes(order.status)) ||
    (role === 'seller' && order.status === 'acknowledged');

  const goodsSubtotal = (order.items ?? []).reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity, 0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href={backHref} className="text-sm text-muted-foreground hover:text-foreground">← Back to orders</Link>
          <h1 className="mt-1 text-2xl font-bold">{order.poNumber}</h1>
          <div className="mt-1 flex items-center gap-3">
            <POStatusBadge status={order.status} />
            <span className="text-xs text-muted-foreground">Version {order.currentVersion}</span>
          </div>
        </div>
        {transitions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {transitions.map((next) => (
              <Button
                key={next}
                size="sm"
                variant={next === 'cancelled' ? 'outline' : 'default'}
                disabled={statusBusy}
                onClick={() => advanceStatus(next)}
              >
                {statusBusy ? '…' : STATUS_LABELS[next] ?? next}
              </Button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Tabs defaultValue={initialTab} onValueChange={(v) => router.replace(`?tab=${v}`, { scroll: false })}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="line-items">Line items</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="container">Container</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted-foreground">Shipping Terms</dt><dd className="font-medium">{order.shippingTerms ?? '—'}</dd></div>
              <div><dt className="text-muted-foreground">Port of Loading</dt><dd className="font-medium">{order.portOfLoading ?? '—'}</dd></div>
              <div><dt className="text-muted-foreground">Port of Discharge</dt><dd className="font-medium">{order.portOfDischarge ?? '—'}</dd></div>
              <div><dt className="text-muted-foreground">Created</dt><dd className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</dd></div>
              <div><dt className="text-muted-foreground">Goods subtotal (COGS)</dt><dd className="font-medium text-primary">{usd(goodsSubtotal)}</dd></div>
            </dl>
          </div>
          <div className="mt-6"><POVersionHistory versions={versions} /></div>
        </TabsContent>

        <TabsContent value="line-items" className="mt-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground text-xs">
                  <th className="pb-2">Product</th>
                  <th className="pb-2">SKU</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Unit FOB</th>
                  <th className="pb-2 text-right">Line total</th>
                  <th className="pb-2 text-right">CBM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(order.items ?? []).map((item) => (
                  <tr key={item.id}>
                    <td className="py-2">{item.product?.name ?? '—'}</td>
                    <td className="py-2 text-muted-foreground">{item.product?.sku ?? '—'}</td>
                    <td className="py-2 text-right">
                      {canEditItems ? (
                        <input
                          type="number"
                          min={1}
                          value={editQty[item.productId] ?? item.quantity}
                          onChange={(e) => setEditQty({ ...editQty, [item.productId]: parseInt(e.target.value, 10) || 1 })}
                          className="w-20 rounded border border-border px-2 py-1 text-right"
                        />
                      ) : item.quantity}
                    </td>
                    <td className="py-2 text-right">{usd(item.unitPriceCents)}</td>
                    <td className="py-2 text-right font-medium">{usd(item.unitPriceCents * item.quantity)}</td>
                    <td className="py-2 text-right">{item.cbmSubtotal.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-semibold">
                  <td colSpan={4} className="pt-3 text-right">COGS subtotal</td>
                  <td className="pt-3 text-right text-primary">{usd(goodsSubtotal)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
            {canEditItems && (
              <Button className="mt-4" onClick={saveItems} disabled={itemsSaving}>
                {itemsSaving ? 'Saving…' : 'Save line items'}
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="mt-4">
          <MessageThread poId={poId} initialMessages={messages} token={token} />
        </TabsContent>

        <TabsContent value="shipping" className="mt-4 space-y-4">
          {(role === 'buyer' || role === 'seller') && shippers.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold mb-3">Request freight quote</h3>
              <div className="flex flex-wrap gap-2">
                {shippers.map((s: any) => (
                  <Button key={s.userId} size="sm" variant="outline" onClick={() => requestQuote(s.userId)}>
                    {s.displayName}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-semibold mb-3">Freight quotes</h3>
            {quotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No quotes yet. Request a quote from a shipping company.</p>
            ) : (
              <div className="space-y-3">
                {quotes.map((q: any) => (
                  <div key={q.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm">
                    <div>
                      <div className="font-medium">
                        {q.shipper?.shipperProfile?.displayName ?? q.shipper?.companyName ?? 'Shipper'}
                      </div>
                      <div className="text-muted-foreground capitalize">{q.status}</div>
                      {q.status === 'submitted' && (
                        <div className="mt-1">{usd(q.freightCents)}{q.transitDays ? ` · ${q.transitDays} days` : ''}</div>
                      )}
                    </div>
                    {(role === 'buyer' || role === 'seller') && q.status === 'submitted' && (
                      <Button size="sm" onClick={() => acceptQuote(q.id)}>Accept quote</Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4 space-y-4">
          {role === 'seller' && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold mb-3">Generate documents</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DOC_TYPES.map(({ value, label }) => (
                  <Button key={value} size="sm" variant="outline" disabled={!!genBusy} onClick={() => generateDoc(value)}>
                    {genBusy === value ? 'Generating…' : label}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-semibold mb-3">Documents</h3>
            {docs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {docs.map((doc: any) => (
                  <li key={doc.id}>
                    {doc.url ? (
                      <a href={doc.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        {doc.docType.replace(/_/g, ' ')}
                      </a>
                    ) : (
                      doc.docType
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="container" className="mt-4">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={containerType}
                onChange={(e) => setContainerType(e.target.value)}
                className="rounded-md border border-border px-3 py-2 text-sm"
              >
                <option value="20ft">20ft</option>
                <option value="40ft">40ft</option>
                <option value="40ft_hc">40ft HC</option>
              </select>
              <Button onClick={runContainerSim}>Run simulation</Button>
            </div>
            {containerResult && (
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-muted-foreground">Total CBM</dt><dd className="font-medium">{containerResult.totalCBM?.toFixed(2)}</dd></div>
                <div><dt className="text-muted-foreground">Containers needed</dt><dd className="font-medium">{containerResult.containersNeeded}</dd></div>
                <div><dt className="text-muted-foreground">Utilization</dt><dd className="font-medium">{containerResult.utilizationPct?.toFixed(1)}%</dd></div>
              </dl>
            )}
          </div>
        </TabsContent>

        <TabsContent value="costs" className="mt-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Landed cost breakdown</h3>
              {role === 'seller' && (
                <Button size="sm" variant="outline" onClick={() => setShowCostForm(!showCostForm)}>
                  {cost ? 'Update' : '+ Add breakdown'}
                </Button>
              )}
            </div>
            {cost && !showCostForm && (
              <div className="divide-y divide-border text-sm">
                {[
                  ['Goods (FOB)', cost.goodsFobCents],
                  ['Ocean Freight', cost.freightCents],
                  ['Insurance', cost.insuranceCents],
                  ['Customs Duty', cost.customsDutyCents],
                  ['Port Handling', cost.portHandlingCents],
                  ['Other', cost.otherCents],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between py-2">
                    <span className="text-muted-foreground">{label as string}</span>
                    <span className="font-medium">{usd(val as number)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-3 font-semibold">
                  <span>Total Landed</span>
                  <span className="text-primary">{usd(cost.totalLandedCents)}</span>
                </div>
              </div>
            )}
            {role === 'seller' && (!cost || showCostForm) && (
              <form onSubmit={saveCost} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {['goodsFob', 'freight', 'insurance', 'customsDuty', 'portHandling', 'other'].map((name) => (
                    <div key={name}>
                      <label className="block text-xs font-medium mb-1 capitalize">{name} (USD)</label>
                      <input
                        type="number" name={name} step="0.01" min="0"
                        defaultValue={cost ? ((cost[`${name}Cents`] ?? 0) / 100).toFixed(2) : '0'}
                        className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
                      />
                    </div>
                  ))}
                </div>
                <textarea name="notes" rows={2} defaultValue={cost?.notes ?? ''} placeholder="Notes" className="w-full rounded-md border border-border px-2 py-1.5 text-sm" />
                <Button type="submit" disabled={costSaving}>{costSaving ? 'Saving…' : 'Save breakdown'}</Button>
              </form>
            )}
            {role === 'buyer' && !cost && (
              <p className="text-sm text-muted-foreground">Seller has not added a cost breakdown yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
