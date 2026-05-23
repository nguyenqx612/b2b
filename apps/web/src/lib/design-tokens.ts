/**
 * HarborLane design tokens — blue + sand + warm accent
 */

export const colors = {
  primary: '#1B4965',
  primaryLight: '#2A628F',
  primaryDark: '#133047',

  secondary: '#62B6CB',
  secondaryLight: '#89C9D9',

  accent: '#F4A261',
  accentLight: '#F7BC8A',

  background: '#FAF7F2',
  surface: '#FFFFFF',
  surfaceHover: '#EDE8DF',
  border: '#D8DEE9',
  borderDark: '#B8C4D4',

  text: {
    primary: '#1F2937',
    secondary: '#4B5563',
    muted: '#6B7280',
    inverse: '#FFFFFF',
  },

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#62B6CB',
};

export const brand = {
  name: 'HarborLane',
  tagline: 'Vietnam exports, cleared for US buyers',
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

export const typography = {
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
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
  sm: '0 1px 2px 0 rgba(27, 73, 101, 0.05)',
  base: '0 1px 3px 0 rgba(27, 73, 101, 0.08), 0 1px 2px 0 rgba(27, 73, 101, 0.04)',
  md: '0 4px 6px -1px rgba(27, 73, 101, 0.08), 0 2px 4px -1px rgba(27, 73, 101, 0.04)',
  lg: '0 10px 15px -3px rgba(27, 73, 101, 0.08), 0 4px 6px -2px rgba(27, 73, 101, 0.04)',
};

export const borderRadius = {
  none: '0px',
  sm: '0.25rem',
  base: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
};

export const pagePadding = 'px-4 sm:px-8 lg:px-12';

export const components = {
  card: {
    shadow: shadows.base,
  },
};
