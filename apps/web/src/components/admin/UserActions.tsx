'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { apiClient, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface UserRow {
  id: string;
  email: string;
  role: string;
  companyName: string | null;
  isActive: boolean;
}

export function UserActions({ user }: { user: UserRow }) {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleActive() {
    if (!token) return;
    setLoading(true);
    try {
      await apiClient.patch(`/api/admin/users/${user.id}`, { isActive: !user.isActive }, token);
      router.refresh();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Badge variant={user.isActive ? 'default' : 'secondary'}>
        {user.isActive ? 'Active' : 'Inactive'}
      </Badge>
      <Button size="sm" variant="outline" disabled={loading} onClick={toggleActive}>
        {user.isActive ? 'Deactivate' : 'Activate'}
      </Button>
    </div>
  );
}
