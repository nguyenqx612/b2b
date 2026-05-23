import { RoleLayout } from '@/components/layout/RoleLayout';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout expectedRole="seller">{children}</RoleLayout>;
}
