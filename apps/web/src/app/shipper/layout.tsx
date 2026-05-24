import { RoleLayout } from '@/components/layout/RoleLayout';

export default function ShipperLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout expectedRole="shipper">{children}</RoleLayout>;
}
