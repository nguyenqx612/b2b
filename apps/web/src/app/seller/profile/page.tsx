'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { vendorTeaserPath } from '@/lib/routes';

export default function SellerProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!session?.user?.accessToken) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/vendor-links/profile`, {
      headers: { Authorization: `Bearer ${session.user.accessToken}` },
    })
      .then((r) => r.json())
      .then((data) => setProfile(data))
      .finally(() => setLoading(false));
  }, [session]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session?.user?.accessToken) return;
    setSaving(true);
    setMessage('');
    const fd = new FormData(e.currentTarget);
    const teaserCategories = String(fd.get('teaserCategories') ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const body = {
      slug: fd.get('slug'),
      displayName: fd.get('displayName'),
      tagline: fd.get('tagline') || undefined,
      about: fd.get('about') || undefined,
      websiteUrl: fd.get('websiteUrl') || undefined,
      catalogSourceUrl: fd.get('catalogSourceUrl') || undefined,
      logoUrl: fd.get('logoUrl') || undefined,
      teaserCategories,
      isPublished: fd.get('isPublished') === 'on',
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/vendor-links/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
      setMessage('Profile saved.');
    } else {
      const err = await res.json();
      setMessage(err.error ?? 'Save failed');
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  const p = profile as {
    slug?: string;
    displayName?: string;
    tagline?: string;
    about?: string;
    websiteUrl?: string;
    catalogSourceUrl?: string;
    logoUrl?: string;
    teaserCategories?: string[];
    isPublished?: boolean;
  } | null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Public vendor profile</h1>
        <p className="text-sm text-muted-foreground">
          Teaser page shown to buyers before catalog access — no SKUs or pricing
        </p>
        {p?.slug && (
          <Link href={vendorTeaserPath(p.slug)} className="mt-2 inline-block text-sm text-primary hover:underline">
            Preview /v/{p.slug} →
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <Field label="URL slug" name="slug" defaultValue={p?.slug ?? ''} required />
        <Field label="Display name" name="displayName" defaultValue={p?.displayName ?? ''} required />
        <Field label="Tagline" name="tagline" defaultValue={p?.tagline ?? ''} />
        <div>
          <label className="mb-1 block text-sm font-medium">About</label>
          <textarea
            name="about"
            rows={4}
            defaultValue={p?.about ?? ''}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>
        <Field label="Website URL" name="websiteUrl" defaultValue={p?.websiteUrl ?? ''} />
        <Field label="Catalog source URL (for import)" name="catalogSourceUrl" defaultValue={p?.catalogSourceUrl ?? ''} />
        <Field label="Logo URL" name="logoUrl" defaultValue={p?.logoUrl ?? ''} />
        <div>
          <label className="mb-1 block text-sm font-medium">Teaser categories (one per line)</label>
          <textarea
            name="teaserCategories"
            rows={6}
            defaultValue={(p?.teaserCategories ?? []).join('\n')}
            className="w-full rounded-md border border-border px-3 py-2 text-sm font-mono"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked={p?.isPublished ?? true} />
          Published (visible on public teaser page)
        </label>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-md border border-border px-3 py-2 text-sm"
      />
    </div>
  );
}
