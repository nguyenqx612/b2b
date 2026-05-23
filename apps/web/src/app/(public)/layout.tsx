import { MarketShell } from '@/components/layout/MarketShell';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <MarketShell fullWidth>{children}</MarketShell>;
}
