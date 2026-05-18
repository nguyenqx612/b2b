'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { POStatusBadge } from '@/components/orders/POStatusBadge';
import { MessageThread } from '@/components/messaging/MessageThread';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Status flow: what the seller can advance to from each status
const SELLER_TRANSITIONS: Record<string, string[]> = {
  submitted:    ['acknowledged', 'cancelled'],
  acknowledged: ['confirmed',    'cancelled'],
  confirmed:    ['in_production','cancelled'],
  in_production:['ready_to_ship'],
  ready_to_ship:['shipped'],
  shipped:      ['delivered'],
};

const STATUS_LABELS: Record<string, string> = {
  acknowledged: 'Acknowledge',
  confirmed:    'Confirm',
  in_production:'Mark In Production',
  ready_to_ship:'Mark Ready to Ship',
  shipped:      'Mark Shipped',
  delivered:    'Mark Delivered',
  cancelled:    'Cancel Order',
};

const DOC_TYPES = [
  { value: 'co_form_b',             label: 'C/O Form B' },
  { value: 'phytosanitary',         label: 'Phytosanitary' },
  { value: 'commercial_invoice',    label: 'Commercial Invoice' },
  { value: 'packing_list',          label: 'Packing List' },
  { value: 'proforma_invoice',      label: 'Proforma Invoice' },
  { value: 'bill_of_lading',        label: 'Bill of Lading' },
  { value: 'us_import_declaration', label: 'US Import Declaration' },
] as const;

function usd(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export default function SellerOrderDetailPage() {
  const { poId } = useParams<{ poId: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken as string;

  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusBusy, setStatusBusy] = useState(false);
  const [genBusy, setGenBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Cost form
  const [showCostForm, setShowCostForm] = useState(false);
  const [costSaving, setCostSaving] = useState(false);
  const [costError, setCostError] = useState('');
  const [existingCost, setExistingCost] = useState<any>(null);

  const authHeader = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    if (!token) return;
    try {
      const [orderRes, msgRes, costRes] = await Promise.all([
        fetch(`${API}/api/orders/${poId}`, { headers: authHeader }),
        fetch(`${API}/api/messages/${poId}`, { headers: authHeader }),
        fetch(`${API}/api/costs/${poId}`, { headers: authHeader }),
      ]);
      setOrder(await orderRes.json());
      setMessages(await msgRes.json());
      const cost = await costRes.json();
      setExistingCost(cost ?? null);
    } catch {
      setError('Failed to load order.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poId, token]);

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
      const updated = await res.json();
      setOrder(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setStatusBusy(false);
    }
  }

  async function generateDoc(docType: string) {
    setGenBusy(docType);
    setError('');
    try {
      const res = await fetch(`${API}/api/documents/${poId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ docType }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank');
    } catch (e: any) {
      setError(e.message ?? 'Document generation failed.');
    } finally {
      setGenBusy(null);
    }
  }

  async function saveCost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCostSaving(true);
    setCostError('');
    const fd = new FormData(e.currentTarget);
    const toCents = (key: string) => Math.round(parseFloat((fd.get(key) as string) || '0') * 100);
    try {
      const res = await fetch(`${API}/api/costs/${poId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          goodsFobCents:    toCents('goodsFob'),
          freightCents:     toCents('freight'),
          insuranceCents:   toCents('insurance'),
          customsDutyCents: toCents('customsDuty'),
          portHandlingCents:toCents('portHandling'),
          otherCents:       toCents('other'),
          notes:            fd.get('notes') as string || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      setExistingCost(await res.json());
      setShowCostForm(false);
    } catch (e: any) {
      setCostError(e.message ?? 'Failed to save cost breakdown.');
    } finally {
      setCostSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-gray-400">
        Loading order…
      </div>
    );
  }

  if (!order || order.error) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        {order?.error ?? 'Order not found.'}
      </div>
    );
  }

  const transitions = SELLER_TRANSITIONS[order.status] ?? [];
  const totalCents = (order.items ?? []).reduce(
    (sum: number, item: any) => sum + item.unitPriceCents * item.quantity, 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link href="/seller/orders" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to orders
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{order.poNumber}</h1>
          <div className="mt-1 flex items-center gap-3">
            <POStatusBadge status={order.status} />
            <span className="text-xs text-gray-500">v{order.currentVersion}</span>
          </div>
        </div>

        {/* Status controls */}
        {transitions.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {transitions.map((next) => (
              <button
                key={next}
                onClick={() => advanceStatus(next)}
                disabled={statusBusy}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                  next === 'cancelled'
                    ? 'border border-red-200 text-red-600 hover:bg-red-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {statusBusy ? '…' : STATUS_LABELS[next] ?? next}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Order details */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold mb-4">Order Details</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm mb-6">
              <div><dt className="text-gray-500">Buyer</dt><dd className="font-medium">{order.buyer?.companyName ?? order.buyer?.email ?? '—'}</dd></div>
              <div><dt className="text-gray-500">Shipping Terms</dt><dd className="font-medium">{order.shippingTerms ?? '—'}</dd></div>
              <div><dt className="text-gray-500">Port of Loading</dt><dd className="font-medium">{order.portOfLoading ?? '—'}</dd></div>
              <div><dt className="text-gray-500">Port of Discharge</dt><dd className="font-medium">{order.portOfDischarge ?? '—'}</dd></div>
              <div><dt className="text-gray-500">Created</dt><dd className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</dd></div>
              <div><dt className="text-gray-500">Order Total</dt><dd className="font-medium text-blue-700">{usd(totalCents)}</dd></div>
            </dl>

            {/* Line items */}
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500 text-xs">
                  <th className="pb-2">Product</th>
                  <th className="pb-2">SKU</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Unit Price</th>
                  <th className="pb-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(order.items ?? []).map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-2">{item.product?.name ?? '—'}</td>
                    <td className="py-2 text-gray-500">{item.product?.sku ?? '—'}</td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">{usd(item.unitPriceCents)}</td>
                    <td className="py-2 text-right font-medium">{usd(item.unitPriceCents * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t">
                  <td colSpan={4} className="pt-3 text-right text-sm font-semibold text-gray-700">Total</td>
                  <td className="pt-3 text-right font-bold text-blue-700">{usd(totalCents)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Cost Breakdown */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Landed Cost Breakdown</h2>
              <button
                onClick={() => setShowCostForm(!showCostForm)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {existingCost ? 'Update' : '+ Add breakdown'}
              </button>
            </div>

            {existingCost && !showCostForm && (
              <div className="divide-y divide-gray-100 text-sm">
                {[
                  ['Goods (FOB)',          existingCost.goodsFobCents],
                  ['Ocean Freight',         existingCost.freightCents],
                  ['Insurance',             existingCost.insuranceCents],
                  ['Customs Duty & Taxes',  existingCost.customsDutyCents],
                  ['Port Handling',         existingCost.portHandlingCents],
                  ['Other',                 existingCost.otherCents],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between py-2">
                    <span className="text-gray-500">{label as string}</span>
                    <span className="font-medium tabular-nums">{usd(val as number)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-3 font-semibold">
                  <span>Total Landed</span>
                  <span className="text-blue-700 text-base">{usd(existingCost.totalLandedCents)}</span>
                </div>
                {existingCost.notes && (
                  <p className="text-xs text-gray-400 pt-2">{existingCost.notes}</p>
                )}
              </div>
            )}

            {(!existingCost || showCostForm) && (
              <form onSubmit={saveCost} className="space-y-4">
                {costError && (
                  <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                    {costError}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'goodsFob',    label: 'Goods (FOB) USD' },
                    { name: 'freight',     label: 'Ocean Freight USD' },
                    { name: 'insurance',   label: 'Insurance USD' },
                    { name: 'customsDuty', label: 'Customs Duty USD' },
                    { name: 'portHandling',label: 'Port Handling USD' },
                    { name: 'other',       label: 'Other USD' },
                  ].map(({ name, label }) => (
                    <div key={name}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                      <input
                        type="number" name={name} step="0.01" min="0"
                        defaultValue={existingCost ? ((existingCost[`${name}Cents`] ?? existingCost[`${name.replace('goodsFob','goodsFob')}Cents`] ?? 0) / 100).toFixed(2) : '0'}
                        className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
                  <textarea
                    name="notes" rows={2}
                    defaultValue={existingCost?.notes ?? ''}
                    className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit" disabled={costSaving}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition"
                  >
                    {costSaving ? 'Saving…' : 'Save breakdown'}
                  </button>
                  {showCostForm && existingCost && (
                    <button type="button" onClick={() => setShowCostForm(false)}
                      className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Document generation */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold mb-4">Generate Documents</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DOC_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => generateDoc(value)}
                  disabled={!!genBusy}
                  className="rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition text-left"
                >
                  {genBusy === value ? '⏳ Generating…' : `📄 ${label}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: messaging */}
        <div className="lg:col-span-1">
          <MessageThread poId={poId} initialMessages={messages} token={token} />
        </div>
      </div>
    </div>
  );
}
