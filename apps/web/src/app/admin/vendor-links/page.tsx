'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

interface UserRow {
  id: string;
  email: string;
  companyName: string | null;
  role: string;
}

interface LinkRow {
  id: string;
  status: string;
  buyer: { email: string; companyName: string | null };
  seller: { email: string; companyName: string | null; vendorProfile?: { displayName: string } | null };
}

export default function AdminVendorLinksPage() {
  const { data: session } = useSession();
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [buyers, setBuyers] = useState<UserRow[]>([]);
  const [sellers, setSellers] = useState<UserRow[]>([]);
  const [buyerId, setBuyerId] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [message, setMessage] = useState('');

  const token = session?.user?.accessToken;
  const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  async function load() {
    if (!token) return;
    const [linksRes, usersRes] = await Promise.all([
      fetch(`${api}/api/admin/vendor-links`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${api}/api/admin/users?limit=100`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    const linksData = await linksRes.json();
    const usersData = await usersRes.json();
    setLinks(linksData.items ?? []);
    const users = usersData.items ?? [];
    setBuyers(users.filter((u: UserRow) => u.role === 'buyer'));
    setSellers(users.filter((u: UserRow) => u.role === 'seller'));
  }

  useEffect(() => {
    load();
  }, [token]);

  async function createLink(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const res = await fetch(`${api}/api/admin/vendor-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ buyerId, sellerId, status: 'approved' }),
    });
    if (res.ok) {
      setMessage('Link created.');
      setBuyerId('');
      setSellerId('');
      load();
    } else {
      const err = await res.json();
      setMessage(err.error ?? 'Failed');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vendor links</h1>
        <p className="text-sm text-muted-foreground">Connect buyers to vendor private catalogs</p>
      </div>

      <form onSubmit={createLink} className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <select
          value={buyerId}
          onChange={(e) => setBuyerId(e.target.value)}
          required
          className="rounded-md border border-border px-3 py-2 text-sm"
        >
          <option value="">Select buyer</option>
          {buyers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.companyName ?? b.email}
            </option>
          ))}
        </select>
        <select
          value={sellerId}
          onChange={(e) => setSellerId(e.target.value)}
          required
          className="rounded-md border border-border px-3 py-2 text-sm"
        >
          <option value="">Select seller</option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.companyName ?? s.email}
            </option>
          ))}
        </select>
        <Button type="submit" className="sm:col-span-2 lg:col-span-1">
          Create approved link
        </Button>
      </form>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.id} className="border-t border-border">
                <td className="px-4 py-3">{link.buyer.companyName ?? link.buyer.email}</td>
                <td className="px-4 py-3">
                  {link.seller.vendorProfile?.displayName ?? link.seller.companyName ?? link.seller.email}
                </td>
                <td className="px-4 py-3 capitalize">{link.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
