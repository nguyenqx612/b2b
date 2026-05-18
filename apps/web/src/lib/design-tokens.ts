/**
 * Design System Tokens
 * Centralized design system using teal monotone color palette
 */

export const colors = {
  // Primary teal palette
  primary: '#062423',
  primaryLight: '#0D3C3B',
  primaryDark: '#001817',

  // Secondary teal
  secondary: '#547475',
  secondaryLight: '#6B8586',

  // Accent teal
  accent: '#A8BEBD',
  accentLight: '#C0D3D2',

  // Neutrals
  background: '#FFFFFF',
  surface: '#F5F7F8',
  surfaceHover: '#EBEEF0',
  border: '#E0E4E5',
  borderDark: '#C8D0D1',

  // Text colors
  text: {
    primary: '#0A0A0A',
    secondary: '#5C6C6D',
    muted: '#8A9A9B',
    inverse: '#FFFFFF',
  },

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
};

export const typography = {
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

export const borderRadius = {
  none: '0px',
  sm: '0.25rem', // 4px
  base: '0.375rem', // 6px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
};

export const transitions = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
};

/**
 * Component-specific tokens
 */

export const components = {
  button: {
    primary: {
      bg: colors.primary,
      text: colors.text.inverse,
      hover: colors.primaryLight,
      active: colors.primaryDark,
      border: colors.primary,
    },
    secondary: {
      bg: colors.surface,
      text: colors.text.primary,
      hover: colors.surfaceHover,
      active: colors.border,
      border: colors.border,
    },
    ghost: {
      bg: 'transparent',
      text: colors.text.primary,
      hover: colors.surface,
      active: colors.surfaceHover,
      border: 'transparent',
    },
  },
  card: {
    bg: colors.background,
    border: colors.border,
    shadow: shadows.base,
    radius: borderRadius.lg,
  },
  input: {
    bg: colors.background,
    border: colors.border,
    focus: colors.primary,
    placeholder: colors.text.muted,
    disabled: colors.surface,
  },
  badge: {
    radius: borderRadius.full,
    padding: `${spacing.xs} ${spacing.sm}`,
  },
};
