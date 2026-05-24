'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import type { Role } from '@b2b/shared';
import { DASHBOARD_BY_ROLE } from '@/lib/routes';
import { vendorTeaserPath } from '@/lib/routes';

export function LandingCTA() {
  const { data: session, status } = useSession();
  const role = session?.user?.role as Role | undefined;
  const isLoggedIn = status === 'authenticated' && !!role;

  if (isLoggedIn) {
    const href = DASHBOARD_BY_ROLE[role!];
    const label =
      role === 'buyer' ? 'My vendors' :
      role === 'seller' ? 'My catalog' :
      role === 'shipper' ? 'My quotes' :
      'Admin dashboard';
    return (
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={href}
          className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          Go to {label}
        </Link>
        <Link
          href="/#vendors"
          className="rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Browse manufacturers
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link
        href="/#vendors"
        className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
      >
        Explore vendors
      </Link>
      <Link
        href="/auth/register"
        className="rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
      >
        Create free account
      </Link>
      <Link
        href="/auth/login"
        className="rounded-lg px-6 py-3 text-sm font-semibold text-primary hover:underline"
      >
        Sign in
      </Link>
    </div>
  );
}
