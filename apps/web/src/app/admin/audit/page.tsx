import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';

interface AuditLog {
  id: string; action: string; entityType: string; entityId: string;
  metadata: unknown; createdAt: string;
  actor: { email: string; role: string };
}

export default async function AdminAuditPage() {
  const session = await auth();
  const token = (session?.user as any)?.accessToken as string;
  const logs = await apiClient.get<AuditLog[]>('/api/admin/audit?limit=100', token);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Log</h1>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">When</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actor</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Entity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-mono text-xs">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2">{log.actor.email}</td>
                <td className="px-4 py-2 font-semibold">{log.action}</td>
                <td className="px-4 py-2 text-gray-500">{log.entityType} / {log.entityId.slice(0, 8)}…</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
