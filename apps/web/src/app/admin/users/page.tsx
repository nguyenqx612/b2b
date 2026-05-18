import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string; email: string; role: string;
  companyName: string | null; isActive: boolean; createdAt: string;
}

export default async function AdminUsersPage() {
  const session = await auth();
  const token = (session?.user as any)?.accessToken as string;
  const users = await apiClient.get<User[]>('/api/admin/users', token);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Company</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 text-gray-700">{u.companyName ?? '—'}</td>
                <td className="px-4 py-3 capitalize">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{u.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
