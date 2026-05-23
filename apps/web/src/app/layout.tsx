import type { Metadata } from 'next';
import './globals.css';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AuthSessionProvider } from '@/components/providers/session-provider';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

import { brand } from '@/lib/design-tokens';

export const metadata: Metadata = {
  title: `${brand.name} — B2B Vietnam Export Marketplace`,
  description: brand.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('font-sans', geist.variable)}>
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
