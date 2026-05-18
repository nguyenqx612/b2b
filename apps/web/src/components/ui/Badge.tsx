import React from 'react';
import { colors, components, spacing, typography } from '@/lib/design-tokens';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const getVariantStyles = (variant: BadgeVariant) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: components.badge.padding,
    borderRadius: components.badge.radius,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    whiteSpace: 'nowrap' as const,
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyles,
        backgroundColor: colors.primary,
        color: colors.text.inverse,
      };
    case 'success':
      return {
        ...baseStyles,
        backgroundColor: colors.success,
        color: colors.text.inverse,
      };
    case 'warning':
      return {
        ...baseStyles,
        backgroundColor: colors.warning,
        color: colors.text.inverse,
      };
    case 'error':
      return {
        ...baseStyles,
        backgroundColor: colors.error,
        color: colors.text.inverse,
      };
    case 'info':
      return {
        ...baseStyles,
        backgroundColor: colors.info,
        color: colors.text.inverse,
      };
    default:
      return baseStyles;
  }
};

export function Badge({ variant = 'primary', children, icon, className = '', ...props }: BadgeProps) {
  const variantStyles = getVariantStyles(variant);

  return (
    <span style={variantStyles} className={className} {...props}>
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
}
