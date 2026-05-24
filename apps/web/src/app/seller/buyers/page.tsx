'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { VendorConversationThread } from '@/components/messaging/VendorConversationThread';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface BuyerLink {
  id: string;
  status: string;
  buyer: { id: string; email: string; companyName: string | null };
}

export default function SellerBuyersPage() {
  const { data: session } = useSession();
  const [links, setLinks] = useState<BuyerLink[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeConv, setActiveConv] = useState<{ id: string; buyerName: string } | null>(null);

  async function loadLinks() {
    if (!session?.user?.accessToken) return;
    const res = await fetch(`${API}/api/vendor-links/seller`, {
      headers: { Authorization: `Bearer ${session.user.accessToken}` },
    });
    const data = await res.json();
    setLinks(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadLinks();
  }, [session]);

  async function inviteBuyer(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.accessToken) return;
    setMessage('');
    const res = await fetch(`${API}/api/vendor-links/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setEmail('');
      setMessage('Buyer invited and approved.');
      loadLinks();
    } else {
      const err = await res.json();
      setMessage(err.error ?? 'Invite failed');
    }
  }

  async function updateStatus(id: string, status: string) {
    if (!session?.user?.accessToken) return;
    await fetch(`${API}/api/vendor-links/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      body: JSON.stringify({ status }),
    });
    loadLinks();
  }

  async function messageBuyer(buyerId: string, buyerName: string) {
    if (!session?.user?.accessToken) return;
    const res = await fetch(`${API}/api/vendor-conversations/buyer/${buyerId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.user.accessToken}` },
    });
    if (res.ok) {
      const conv = await res.json();
      setActiveConv({ id: conv.id, buyerName });
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Buyer access</h1>
        <p className="text-sm text-muted-foreground">Manage who can view your private wholesale catalog</p>
      </div>

      <form onSubmit={inviteBuyer} className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="buyer@company.com"
          required
          className="min-w-[240px] flex-1 rounded-md border border-border px-3 py-2 text-sm"
        />
        <Button type="submit">Invite buyer</Button>
      </form>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      {activeConv && session?.user?.accessToken && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Message {activeConv.buyerName}</h2>
            <Button size="sm" variant="ghost" onClick={() => setActiveConv(null)}>Close</Button>
          </div>
          <VendorConversationThread
            conversationId={activeConv.id}
            token={session.user.accessToken}
            currentUserId={session.user.id}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Buyer</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="font-medium">{link.buyer.companyName ?? link.buyer.email}</div>
                  <div className="text-xs text-muted-foreground">{link.buyer.email}</div>
                </td>
                <td className="px-4 py-3 capitalize">{link.status}</td>
                <td className="px-4 py-3 space-x-2">
                  {link.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => updateStatus(link.id, 'approved')}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(link.id, 'blocked')}>
                        Reject
                      </Button>
                    </>
                  )}
                  {link.status === 'approved' && (
                    <Button size="sm" variant="outline" onClick={() => messageBuyer(link.buyer.id, link.buyer.companyName ?? link.buyer.email)}>
                      Message buyer
                    </Button>
                  )}
                  {link.status === 'approved' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(link.id, 'blocked')}>
                      Reject
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {links.length === 0 && (
          <p className="px-4 py-8 text-center text-muted-foreground">No buyer connections yet.</p>
        )}
      </div>
    </div>
  );
}
