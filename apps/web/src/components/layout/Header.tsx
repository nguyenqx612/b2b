'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Menu, LogOut, Settings, ChevronDown } from 'lucide-react';
import { colors, spacing, typography, components } from '@/lib/design-tokens';

interface HeaderProps {
  onMenuToggle?: () => void;
  title?: string;
}

export function Header({ onMenuToggle, title }: HeaderProps) {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const user = session?.user;
  const userRole = (user as any)?.role || 'User';

  return (
    <header
      style={{
        width: '100%',
        backgroundColor: colors.background,
        borderBottom: `1px solid ${colors.border}`,
        boxShadow: components.card.shadow,
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${spacing.md} ${spacing.lg}`,
          maxWidth: '1536px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {/* Left: Sidebar toggle + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <button
            onClick={onMenuToggle}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: spacing.sm,
              display: 'flex',
              alignItems: 'center',
              color: colors.text.primary,
              transition: 'color 200ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = colors.primary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.text.primary)}
          >
            <Menu size={24} />
          </button>
          {title && (
            <h1
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
              }}
            >
              {title}
            </h1>
          )}
        </div>

        {/* Right: User menu */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                padding: `${spacing.xs} ${spacing.md}`,
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                color: colors.text.primary,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                transition: 'all 200ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.surfaceHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.surface;
              }}
            >
              <div>
                <div style={{ fontSize: typography.fontSize.xs }}>
                  {user.email}
                </div>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.text.muted }}>
                  {userRole}
                </div>
              </div>
              <ChevronDown
                size={16}
                style={{
                  transition: 'transform 200ms',
                  transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {/* User menu dropdown */}
            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: spacing.sm,
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  boxShadow: components.card.shadow,
                  minWidth: '200px',
                  zIndex: 50,
                }}
              >
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // Navigate to settings
                  }}
                  style={{
                    width: '100%',
                    padding: `${spacing.md} ${spacing.lg}`,
                    textAlign: 'left',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.md,
                    color: colors.text.primary,
                    fontSize: typography.fontSize.sm,
                    transition: 'background-color 200ms',
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.surface;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Settings size={16} />
                  Settings
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    signOut({ callbackUrl: '/auth/login' });
                  }}
                  style={{
                    width: '100%',
                    padding: `${spacing.md} ${spacing.lg}`,
                    textAlign: 'left',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.md,
                    color: colors.error,
                    fontSize: typography.fontSize.sm,
                    transition: 'background-color 200ms',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.surface;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
