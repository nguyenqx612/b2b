'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingCart, 
  Zap, 
  Users, 
  BarChart3, 
  Settings,
  X 
} from 'lucide-react';
import { colors, spacing, typography } from '@/lib/design-tokens';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  items: NavItem[];
  title?: string;
}

export function Sidebar({ isOpen, onClose, items, title }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 39,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 64, // Height of header
          width: '250px',
          height: 'calc(100vh - 64px)',
          backgroundColor: colors.surface,
          borderRight: `1px solid ${colors.border}`,
          overflowY: 'auto',
          zIndex: 40,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 300ms',
        }}
      >
        <nav style={{ padding: spacing.lg }}>
          {title && (
            <h2
              style={{
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.bold,
                textTransform: 'uppercase',
                color: colors.text.muted,
                marginBottom: spacing.lg,
                letterSpacing: '0.05em',
              }}
            >
              {title}
            </h2>
          )}

          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.href} style={{ marginBottom: spacing.sm }}>
                  <Link href={item.href}>
                    <a
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.md,
                        padding: `${spacing.md} ${spacing.lg}`,
                        color: isActive ? colors.primary : colors.text.secondary,
                        backgroundColor: isActive ? colors.background : 'transparent',
                        borderRadius: '6px',
                        fontSize: typography.fontSize.sm,
                        fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.normal,
                        textDecoration: 'none',
                        transition: 'all 200ms',
                        borderLeft: `3px solid ${isActive ? colors.primary : 'transparent'}`,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = colors.background;
                          e.currentTarget.style.color = colors.text.primary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = colors.text.secondary;
                        }
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile close button */}
      {isOpen && (
        <button
          onClick={onClose}
          style={{
            position: 'fixed',
            top: spacing.lg,
            left: 'calc(250px - 40px)',
            width: '40px',
            height: '40px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: colors.text.primary,
            zIndex: 41,
            display: 'none',
          }}
          className="md:hidden"
        >
          <X size={24} />
        </button>
      )}
    </>
  );
}

/**
 * Predefined nav items for each role
 */
export const buyerNavItems: NavItem[] = [
  {
    label: 'My Vendors',
    href: '/buyer/vendors',
    icon: <ShoppingCart size={18} />,
  },
  {
    label: 'My Orders',
    href: '/buyer/orders',
    icon: <Zap size={18} />,
  },
];

export const sellerNavItems: NavItem[] = [
  {
    label: 'Product Catalog',
    href: '/seller/catalog',
    icon: <ShoppingCart size={18} />,
  },
  {
    label: 'Manage Orders',
    href: '/seller/orders',
    icon: <BarChart3 size={18} />,
  },
];

export const adminNavItems: NavItem[] = [
  {
    label: 'Users',
    href: '/admin/users',
    icon: <Users size={18} />,
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: <Zap size={18} />,
  },
  {
    label: 'Audit Log',
    href: '/admin/audit',
    icon: <BarChart3 size={18} />,
  },
];
