'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Anchor, Search } from 'lucide-react';
import type { Role } from '@b2b/shared';
import { DASHBOARD_BY_ROLE, PUBLIC_CATALOG } from '@/lib/routes';
import { brand, pagePadding } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';

const WORKSPACE_LABEL: Record<Role, string> = {
  buyer: 'My Orders',
  seller: 'My Products',
  admin: 'Admin Panel',
};

interface MarketShellProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function MarketShell({ children, fullWidth = true }: MarketShellProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const role = session?.user?.role as Role | undefined;
  const isLoggedIn = status === 'authenticated' && !!role;

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('search');
    const params = q ? `?search=${encodeURIComponent(String(q))}` : '';
    router.push(`${PUBLIC_CATALOG}${params}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className={`${pagePadding} flex h-16 items-center gap-4`}>
          <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold text-primary">
            <Anchor className="h-5 w-5 text-secondary" />
            <span className="hidden sm:inline">{brand.name}</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden flex-1 md:flex md:max-w-2xl">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="search"
                placeholder="Search marketplace…"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
            <Button type="submit" className="ml-2 shrink-0 bg-accent text-accent-foreground hover:opacity-90">
              Search
            </Button>
          </form>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href={PUBLIC_CATALOG}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            >
              Marketplace
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link href={DASHBOARD_BY_ROLE[role!]}>
                  <Button variant="outline" size="sm" type="button">
                    {WORKSPACE_LABEL[role!]}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" type="button">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" type="button" className="bg-accent text-accent-foreground hover:opacity-90">
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className={fullWidth ? 'w-full' : 'mx-auto max-w-7xl'}>{children}</main>
    </div>
  );
}
