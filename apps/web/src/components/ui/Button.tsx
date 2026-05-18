import React from 'react';
import { colors, components, spacing, borderRadius, typography } from '@/lib/design-tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const sizeStyles = {
  sm: {
    padding: `${spacing.xs} ${spacing.md}`,
    fontSize: typography.fontSize.sm,
  },
  md: {
    padding: `${spacing.sm} ${spacing.lg}`,
    fontSize: typography.fontSize.base,
  },
  lg: {
    padding: `${spacing.md} ${spacing.xl}`,
    fontSize: typography.fontSize.lg,
  },
};

const getVariantStyles = (variant: ButtonVariant) => {
  const baseStyles = {
    fontWeight: typography.fontWeight.medium,
    borderRadius: borderRadius.md,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 200ms',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    whiteSpace: 'nowrap' as const,
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyles,
        backgroundColor: components.button.primary.bg,
        color: components.button.primary.text,
        border: `1px solid ${components.button.primary.border}`,
      };
    case 'secondary':
      return {
        ...baseStyles,
        backgroundColor: components.button.secondary.bg,
        color: components.button.secondary.text,
        border: `1px solid ${components.button.secondary.border}`,
      };
    case 'ghost':
      return {
        ...baseStyles,
        backgroundColor: components.button.ghost.bg,
        color: components.button.ghost.text,
        border: `1px solid ${components.button.ghost.border}`,
      };
    case 'outline':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: colors.primary,
        border: `1px solid ${colors.primary}`,
      };
    default:
      return baseStyles;
  }
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  style = {},
  disabled = false,
  ...props
}: ButtonProps) {
  const variantStyles = getVariantStyles(variant);
  const sizeStyle = sizeStyles[size];

  const combinedStyle = {
    ...variantStyles,
    ...sizeStyle,
    ...(disabled && { opacity: 0.6, cursor: 'not-allowed' }),
    ...style,
  };

  return (
    <button
      style={combinedStyle}
      disabled={disabled}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled) {
          const hoverColor = variant === 'primary' ? components.button.primary.hover : colors.primaryLight;
          e.currentTarget.style.backgroundColor = hoverColor;
        }
      }}
      onMouseLeave={(e) => {
        const bgColor = variant === 'primary' ? components.button.primary.bg : components.button.secondary.bg;
        e.currentTarget.style.backgroundColor = bgColor;
      }}
      {...props}
    />
  );
}
