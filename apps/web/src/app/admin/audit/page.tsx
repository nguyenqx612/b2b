import { getSessionToken } from '@/lib/session';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/layout/DataTable';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: unknown;
  createdAt: string;
  actor: { email: string; role: string };
}

export default async function AdminAuditPage() {
  const token = await getSessionToken();
  const { items: logs, total } = await apiClient.get<{ items: AuditLog[]; total: number }>(
    '/api/admin/audit?limit=100',
    token,
  );

  return (
    <div>
      <PageHeader title="Audit Log" description={`${total} entries`} />
      <DataTable
        data={logs}
        keyFn={(l) => l.id}
        emptyMessage="No audit entries"
        columns={[
          { key: 'time', header: 'When', cell: (l) => new Date(l.createdAt).toLocaleString() },
          { key: 'actor', header: 'Actor', cell: (l) => l.actor.email },
          { key: 'action', header: 'Action', cell: (l) => l.action },
          { key: 'entity', header: 'Entity', cell: (l) => `${l.entityType} / ${l.entityId.slice(0, 8)}…` },
        ]}
      />
    </div>
  );
}
