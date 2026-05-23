import { RoleLayout } from '@/components/layout/RoleLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout expectedRole="admin">{children}</RoleLayout>;
}
