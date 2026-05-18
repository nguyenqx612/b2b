import React from 'react';
import { spacing } from '@/lib/design-tokens';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: string;
}

export function PageContainer({ 
  children, 
  maxWidth = '1536px', // max-w-screen-2xl
  className = '', 
  style = {},
  ...props 
}: PageContainerProps) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: spacing.md,
        paddingRight: spacing.md,
        ...style,
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}
