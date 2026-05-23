import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { apiClient, ApiError } from '@/lib/api-client';
import { getSessionToken } from '@/lib/session';
import { dashboardForRole } from '@/lib/routes';
import type { Role } from '@b2b/shared';

interface RoleLayoutProps {
  children: React.ReactNode;
  expectedRole: Role;
}

export async function RoleLayout({ children, expectedRole }: RoleLayoutProps) {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const { role, email, companyName } = session.user;
  if (role !== expectedRole && role !== 'admin') {
    redirect(dashboardForRole(role));
  }

  try {
    const token = await getSessionToken();
    await apiClient.get('/api/auth/me', token);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      redirect('/api/auth/signout?callbackUrl=/auth/login');
    }
    throw err;
  }

  return (
    <AppShell role={role} email={email ?? ''} companyName={companyName}>
      {children}
    </AppShell>
  );
}
