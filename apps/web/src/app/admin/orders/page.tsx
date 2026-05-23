import { getSessionToken } from '@/lib/session';
import { apiClient } from '@/lib/api-client';
import { POStatusBadge } from '@/components/orders/POStatusBadge';
import type { OrderStatus } from '@b2b/shared';
import Link from 'next/link';

interface AdminOrder {
  id: string;
  poNumber: string;
  status: OrderStatus;
  currentVersion: number;
  shippingTerms: string | null;
  createdAt: string;
  updatedAt: string;
  buyer: { email: string; companyName: string | null };
  seller: { email: string; companyName: string | null };
  _count: { items: number };
}

const STATUS_OPTIONS = [
  'all', 'draft', 'submitted', 'acknowledged', 'confirmed',
  'in_production', 'ready_to_ship', 'shipped', 'delivered', 'cancelled',
];

interface Props {
  searchParams: Promise<{ status?: string; search?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const token = await getSessionToken();
  const params = await searchParams;

  const qs = new URLSearchParams();
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  if (params.search) qs.set('search', params.search);

  const { items: orders, total } = await apiClient.get<{ items: AdminOrder[]; total: number }>(
    `/api/admin/orders?${qs}`,
    token,
  );
  const activeStatus = params.status ?? 'all';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Orders</h1>
        <span className="text-sm text-muted-foreground">{total} order{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form method="GET" className="flex-1 flex gap-2">
          <input
            name="search"
            defaultValue={params.search}
            placeholder="Search PO number, buyer, seller…"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {params.status && params.status !== 'all' && (
            <input type="hidden" name="status" value={params.status} />
          )}
          <button type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
            Search
          </button>
        </form>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}${params.search ? `&search=${params.search}` : ''}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition capitalize ${
              activeStatus === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.replace('_', ' ')}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {orders.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No orders found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">PO Number</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Buyer</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Seller</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Items</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Created</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium text-gray-900">
                    {order.poNumber}
                    {order.currentVersion > 1 && (
                      <span className="ml-1.5 rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-500">
                        v{order.currentVersion}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{order.buyer.companyName ?? '—'}</div>
                    <div className="text-xs text-gray-400">{order.buyer.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{order.seller.companyName ?? '—'}</div>
                    <div className="text-xs text-gray-400">{order.seller.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <POStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-center">
                    {order._count?.items ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(order.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
