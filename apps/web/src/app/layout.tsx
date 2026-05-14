import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'B2B Trade Platform',
  description: 'Centralized B2B international trade order management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
