'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface Props {
  slug: string;
  sellerId?: string;
  initialStatus?: string | null;
}

export function VendorAccessRequest({ slug, sellerId, initialStatus }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [status, setStatus] = useState(initialStatus ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRequest() {
    if (!session?.user?.accessToken) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/v/${slug}`)}`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/vendor-links/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({ slug, sellerId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Request failed');
      setStatus(body.status ?? 'pending');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'approved') {
    return (
      <Link href={`/buyer/vendors/${slug}/catalog`}>
        <Button className="bg-accent text-accent-foreground hover:opacity-90">
          Browse wholesale catalog →
        </Button>
      </Link>
    );
  }

  if (status === 'pending') {
    return (
      <p className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
        Your access request is pending vendor approval.
      </p>
    );
  }

  if (status === 'blocked') {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Access to this vendor catalog is not available.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {session?.user?.role === 'buyer' ? (
        <Button onClick={handleRequest} disabled={loading} className="bg-accent text-accent-foreground hover:opacity-90">
          {loading ? 'Submitting…' : 'Request wholesale access'}
        </Button>
      ) : session ? (
        <p className="text-sm text-muted-foreground">Sign in as a buyer to request catalog access.</p>
      ) : (
        <Link href={`/auth/login?callbackUrl=${encodeURIComponent(`/v/${slug}`)}`}>
          <Button className="bg-accent text-accent-foreground hover:opacity-90">Sign in to request access</Button>
        </Link>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
