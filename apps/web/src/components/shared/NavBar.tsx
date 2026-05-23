'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import type { Role } from '@b2b/shared';

interface NavItem { href: string; label: string }

const BUYER_NAV: NavItem[] = [
  { href: '/catalog', label: 'Marketplace' },
  { href: '/buyer/orders',  label: 'My Orders' },
];

const SELLER_NAV: NavItem[] = [
  { href: '/seller/catalog', label: 'My Products' },
  { href: '/seller/orders',  label: 'Orders' },
];

const ADMIN_NAV: NavItem[] = [
  { href: '/admin/users',  label: 'Users' },
  { href: '/admin/orders', label: 'All Orders' },
  { href: '/admin/audit',  label: 'Audit Log' },
];

const NAV_MAP: Record<Role, NavItem[]> = {
  buyer:  BUYER_NAV,
  seller: SELLER_NAV,
  admin:  ADMIN_NAV,
};

const HOME_MAP: Record<Role, string> = {
  buyer:  '/buyer/orders',
  seller: '/seller/catalog',
  admin:  '/admin/users',
};

interface Props {
  role: Role;
  email: string;
  companyName?: string | null;
}

export function NavBar({ role, email, companyName }: Props) {
  const pathname = usePathname();
  const navItems = NAV_MAP[role] ?? [];
  const homeHref = HOME_MAP[role] ?? '/catalog';

  return (
    <header className="sticky top-0 z-30 border-b border-[#A8BEBD]/20 bg-[#062423] shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">

        {/* Left: logo + nav */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href={homeHref} className="flex items-center gap-2 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#547475] group-hover:bg-[#A8BEBD] transition-colors">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M20 7l-8-4-8 4m16 0v10l-8 4m0-14L4 17m16-10l-8 4M4 7l8 4" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight text-white">B2B Trade</span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-0.5">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-[#A8BEBD] hover:bg-white/5 hover:text-white',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: user info + sign out */}
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <div className="text-xs font-semibold text-white">
              {companyName ?? email}
            </div>
            <div className="text-[10px] capitalize text-[#A8BEBD]">{role}</div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#A8BEBD]
                       hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
