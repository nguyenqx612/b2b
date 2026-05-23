import { RoleLayout } from '@/components/layout/RoleLayout';

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout expectedRole="buyer">{children}</RoleLayout>;
}
