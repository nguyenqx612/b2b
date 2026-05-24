'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Anchor } from 'lucide-react';
import type { Role } from '@b2b/shared';
import { DASHBOARD_BY_ROLE } from '@/lib/routes';
import { brand, pagePadding } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';

interface MarketShellProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function MarketShell({ children, fullWidth = true }: MarketShellProps) {
  const { data: session, status } = useSession();
  const role = session?.user?.role as Role | undefined;
  const isLoggedIn = status === 'authenticated' && !!role;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className={`${pagePadding} flex h-16 items-center gap-4`}>
          <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold text-primary">
            <Anchor className="h-5 w-5 text-secondary" />
            <span className="hidden sm:inline">{brand.name}</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/#vendors"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            >
              Vendors
            </Link>
            <Link
              href="/#how-it-works"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            >
              How it works
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link href={DASHBOARD_BY_ROLE[role!]}>
                  <Button variant="outline" size="sm" type="button">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" type="button">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" type="button" className="bg-accent text-accent-foreground hover:opacity-90">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={fullWidth ? 'w-full' : 'mx-auto max-w-7xl px-4 py-6'}>{children}</main>
    </div>
  );
}
