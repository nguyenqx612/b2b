import { getSessionToken } from '@/lib/session';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/layout/DataTable';
import { UserActions } from '@/components/admin/UserActions';

interface User {
  id: string;
  email: string;
  role: string;
  companyName: string | null;
  isActive: boolean;
  createdAt: string;
}

export default async function AdminUsersPage() {
  const token = await getSessionToken();
  const { items: users, total } = await apiClient.get<{ items: User[]; total: number }>(
    '/api/admin/users',
    token,
  );

  return (
    <div>
      <PageHeader title="User Management" description={`${total} users`} />
      <DataTable
        data={users}
        keyFn={(u) => u.id}
        emptyMessage="No users found"
        columns={[
          { key: 'email', header: 'Email', cell: (u) => u.email },
          { key: 'company', header: 'Company', cell: (u) => u.companyName ?? '—' },
          { key: 'role', header: 'Role', cell: (u) => <span className="capitalize">{u.role}</span> },
          { key: 'joined', header: 'Joined', cell: (u) => new Date(u.createdAt).toLocaleDateString() },
          {
            key: 'actions',
            header: 'Actions',
            className: 'text-right',
            cell: (u) => <UserActions user={u} />,
          },
        ]}
      />
    </div>
  );
}
