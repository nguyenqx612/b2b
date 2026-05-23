'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Menu, Anchor } from 'lucide-react';
import type { Role } from '@b2b/shared';
import { cn } from '@/lib/utils';
import { DASHBOARD_BY_ROLE } from '@/lib/routes';
import { brand } from '@/lib/design-tokens';
import { Button } from '@/components/ui/Button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  href: string;
  label: string;
}

const NAV_MAP: Record<Role, NavItem[]> = {
  buyer: [
    { href: '/catalog', label: 'Marketplace' },
    { href: '/buyer/orders', label: 'My Orders' },
  ],
  seller: [
    { href: '/seller/catalog', label: 'My Products' },
    { href: '/seller/orders', label: 'Orders' },
  ],
  admin: [
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/orders', label: 'All Orders' },
    { href: '/admin/audit', label: 'Audit Log' },
  ],
};

const HOME_MAP = DASHBOARD_BY_ROLE;

interface AppShellProps {
  role: Role;
  email: string;
  companyName?: string | null;
  children: React.ReactNode;
}

function NavLinks({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'rounded-md px-3 py-2 text-sm font-medium transition-colors',
            pathname === item.href || pathname.startsWith(item.href + '/')
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function AppShell({ role, email, companyName, children }: AppShellProps) {
  const pathname = usePathname();
  const navItems = NAV_MAP[role] ?? [];
  const homeHref = HOME_MAP[role] ?? '/catalog';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href={homeHref} className="flex items-center gap-2 font-semibold text-primary">
            <Anchor className="h-5 w-5 text-secondary" />
            <span className="hidden sm:inline">{brand.name}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLinks items={navItems} pathname={pathname} />
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:block text-right text-xs">
              <div className="font-medium text-foreground">{companyName ?? email}</div>
              <div className="text-muted-foreground capitalize">{role}</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
              Sign out
            </Button>
            <Sheet>
              <SheetTrigger className="md:hidden inline-flex">
                <Button variant="ghost" size="icon" type="button">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="mt-6 flex flex-col gap-1">
                  <NavLinks items={navItems} pathname={pathname} />
                </div>
                <Separator className="my-4" />
                <p className="text-xs text-muted-foreground">{email}</p>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
