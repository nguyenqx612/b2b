import React from 'react';
import { components, spacing, borderRadius, typography, colors } from '@/lib/design-tokens';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
      {label && (
        <label
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          style={{
            width: '100%',
            padding: `${spacing.sm} ${spacing.md}`,
            paddingLeft: icon ? `calc(${spacing.lg} + ${spacing.md})` : spacing.md,
            fontSize: typography.fontSize.base,
            border: `1px solid ${error ? colors.error : components.input.border}`,
            borderRadius: borderRadius.md,
            backgroundColor: props.disabled ? components.input.disabled : components.input.bg,
            color: colors.text.primary,
            transition: 'all 200ms',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => {
            if (!props.disabled) {
              e.currentTarget.style.borderColor = components.input.focus;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${components.input.focus}33`;
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = error ? colors.error : components.input.border;
          }}
          {...props}
        />
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: spacing.md,
              display: 'flex',
              alignItems: 'center',
              color: colors.text.muted,
            }}
          >
            {icon}
          </div>
        )}
      </div>
      {error && (
        <span style={{ fontSize: typography.fontSize.sm, color: colors.error }}>
          {error}
        </span>
      )}
    </div>
  );
}
