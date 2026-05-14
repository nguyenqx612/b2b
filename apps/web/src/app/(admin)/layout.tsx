import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { NavBar } from '@/components/shared/NavBar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');
  const user = session.user as any;
  if (user.role !== 'admin') redirect('/');

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar role="admin" email={session.user?.email ?? ''} companyName={user.companyName} />
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
