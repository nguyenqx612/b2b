'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { VendorConversationThread } from '@/components/messaging/VendorConversationThread';
import { vendorTeaserPath } from '@/lib/routes';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface InboxItem {
  id: string;
  seller: {
    companyName: string | null;
    vendorProfile: { displayName: string; slug: string } | null;
  };
  messages: Array<{ body: string | null; createdAt: string }>;
}

export default function BuyerMessagesPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const [items, setItems] = useState<InboxItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/vendor-conversations/inbox`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        if (data.items?.[0]) setActiveId(data.items[0].id);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground">Conversations with your vendor partners</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No conversations yet.</p>
          <Link href="/buyer/vendors" className="mt-2 inline-block text-sm text-primary hover:underline">
            Browse vendors →
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-2">
            {items.map((item) => {
              const name = item.seller.vendorProfile?.displayName ?? item.seller.companyName ?? 'Vendor';
              const preview = item.messages[0]?.body ?? 'No messages';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  className={`w-full rounded-lg border p-3 text-left text-sm ${
                    activeId === item.id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="font-medium">{name}</div>
                  <div className="truncate text-xs text-muted-foreground">{preview}</div>
                </button>
              );
            })}
          </div>
          <div className="lg:col-span-2">
            {activeId && token && (
              <>
                {(() => {
                  const active = items.find((i) => i.id === activeId);
                  const slug = active?.seller.vendorProfile?.slug;
                  return slug ? (
                    <Link href={vendorTeaserPath(slug)} className="mb-2 inline-block text-xs text-primary hover:underline">
                      View vendor profile →
                    </Link>
                  ) : null;
                })()}
                <VendorConversationThread
                  conversationId={activeId}
                  token={token}
                  currentUserId={session?.user?.id}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
