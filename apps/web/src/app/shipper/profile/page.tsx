'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function ShipperProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!session?.user?.accessToken) return;
    fetch(`${API}/api/freight/shipper/profile`, {
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
    const serviceRegions = String(fd.get('serviceRegions') ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const body = {
      slug: fd.get('slug'),
      displayName: fd.get('displayName'),
      tagline: fd.get('tagline') || undefined,
      about: fd.get('about') || undefined,
      logoUrl: fd.get('logoUrl') || undefined,
      serviceRegions,
      isPublished: fd.get('isPublished') === 'on',
    };

    const res = await fetch(`${API}/api/freight/shipper/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      setProfile(await res.json());
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
    logoUrl?: string;
    serviceRegions?: string[];
    isPublished?: boolean;
  } | null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Shipper profile</h1>
        <p className="text-sm text-muted-foreground">
          Your public profile appears when buyers and sellers request freight quotes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <Field label="URL slug" name="slug" defaultValue={p?.slug ?? ''} required />
        <Field label="Display name" name="displayName" defaultValue={p?.displayName ?? ''} required />
        <Field label="Tagline" name="tagline" defaultValue={p?.tagline ?? ''} />
        <Field label="Logo URL" name="logoUrl" defaultValue={p?.logoUrl ?? ''} />
        <div>
          <label className="mb-1 block text-sm font-medium">About</label>
          <textarea name="about" rows={4} defaultValue={p?.about ?? ''} className="w-full rounded-md border border-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Service regions (one per line)</label>
          <textarea
            name="serviceRegions"
            rows={4}
            defaultValue={(p?.serviceRegions ?? []).join('\n')}
            className="w-full rounded-md border border-border px-3 py-2 text-sm font-mono"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked={p?.isPublished ?? true} />
          Published (visible in shipper directory)
        </label>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</Button>
      </form>
    </div>
  );
}

function Field({ label, name, defaultValue, required }: { label: string; name: string; defaultValue?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input name={name} defaultValue={defaultValue} required={required} className="w-full rounded-md border border-border px-3 py-2 text-sm" />
    </div>
  );
}
