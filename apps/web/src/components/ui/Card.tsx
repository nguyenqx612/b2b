import React from 'react';
import { components, spacing } from '@/lib/design-tokens';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

export function Card({ children, noPadding = false, className = '', ...props }: CardProps) {
  return (
    <div
      style={{
        backgroundColor: components.card.bg,
        border: `1px solid ${components.card.border}`,
        boxShadow: components.card.shadow,
        borderRadius: components.card.radius,
        padding: noPadding ? 0 : spacing.lg,
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}
