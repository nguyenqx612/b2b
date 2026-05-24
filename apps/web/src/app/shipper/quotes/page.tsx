'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function usd(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export default function ShipperQuotesPage() {
  const { data: session } = useSession();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, { freight: string; transitDays: string; notes: string }>>({});

  async function loadQuotes() {
    if (!session?.user?.accessToken) return;
    const res = await fetch(`${API}/api/freight/shipper/quotes`, {
      headers: { Authorization: `Bearer ${session.user.accessToken}` },
    });
    const data = await res.json();
    setQuotes(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadQuotes();
  }, [session]);

  async function submitQuote(quoteId: string) {
    if (!session?.user?.accessToken) return;
    const form = forms[quoteId] ?? { freight: '', transitDays: '', notes: '' };
    setSubmitting(quoteId);
    await fetch(`${API}/api/freight/quotes/${quoteId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      body: JSON.stringify({
        freightCents: Math.round(parseFloat(form.freight || '0') * 100),
        transitDays: form.transitDays ? parseInt(form.transitDays, 10) : undefined,
        notes: form.notes || undefined,
      }),
    });
    setSubmitting(null);
    loadQuotes();
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Freight quotes</h1>
        <p className="text-sm text-muted-foreground">POs awaiting your quote and submitted quotes</p>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          No quote requests yet. Make sure your profile is published.
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((q) => (
            <div key={q.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{q.po?.poNumber ?? q.poId}</div>
                  <div className="text-sm text-muted-foreground capitalize">{q.status}</div>
                  {q.po && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {q.po.portOfLoading ?? '—'} → {q.po.portOfDischarge ?? '—'}
                    </div>
                  )}
                </div>
                {q.status === 'submitted' && (
                  <div className="text-sm font-medium text-primary">{usd(q.freightCents)}</div>
                )}
              </div>

              {(q.status === 'draft' || q.status === 'submitted') && q.status === 'draft' && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Freight USD"
                    value={forms[q.id]?.freight ?? ''}
                    onChange={(e) => setForms({ ...forms, [q.id]: { ...forms[q.id], freight: e.target.value, transitDays: forms[q.id]?.transitDays ?? '', notes: forms[q.id]?.notes ?? '' } })}
                    className="rounded-md border border-border px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Transit days"
                    value={forms[q.id]?.transitDays ?? ''}
                    onChange={(e) => setForms({ ...forms, [q.id]: { ...forms[q.id], transitDays: e.target.value, freight: forms[q.id]?.freight ?? '', notes: forms[q.id]?.notes ?? '' } })}
                    className="rounded-md border border-border px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Notes"
                    value={forms[q.id]?.notes ?? ''}
                    onChange={(e) => setForms({ ...forms, [q.id]: { ...forms[q.id], notes: e.target.value, freight: forms[q.id]?.freight ?? '', transitDays: forms[q.id]?.transitDays ?? '' } })}
                    className="rounded-md border border-border px-3 py-2 text-sm"
                  />
                </div>
              )}

              {q.status === 'draft' && (
                <Button size="sm" disabled={submitting === q.id} onClick={() => submitQuote(q.id)}>
                  {submitting === q.id ? 'Submitting…' : 'Submit quote'}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
