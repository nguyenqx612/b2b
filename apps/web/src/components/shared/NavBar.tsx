'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import type { Role } from '@b2b/shared';

interface NavItem { href: string; label: string }

const BUYER_NAV: NavItem[] = [
  { href: '/buyer/catalog', label: 'Catalog' },
  { href: '/buyer/orders', label: 'My Orders' },
];

const SELLER_NAV: NavItem[] = [
  { href: '/seller/catalog', label: 'My Products' },
  { href: '/seller/orders', label: 'Orders' },
];

const ADMIN_NAV: NavItem[] = [
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/orders', label: 'All Orders' },
  { href: '/admin/audit', label: 'Audit Log' },
];

const NAV_MAP: Record<Role, NavItem[]> = {
  buyer: BUYER_NAV,
  seller: SELLER_NAV,
  admin: ADMIN_NAV,
};

interface Props {
  role: Role;
  email: string;
  companyName?: string | null;
}

export function NavBar({ role, email, companyName }: Props) {
  const pathname = usePathname();
  const navItems = NAV_MAP[role] ?? [];

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-bold text-blue-700 tracking-tight">
            B2B Trade
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition',
                  pathname.startsWith(item.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-900">{companyName ?? email}</div>
            <div className="text-xs text-gray-500 capitalize">{role}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-sm text-gray-500 hover:text-red-600 transition"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
