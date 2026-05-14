import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import type { PurchaseOrder } from '@b2b/shared';
import { POStatusBadge } from '@/components/orders/POStatusBadge';

export default async function BuyerOrdersPage() {
  const session = await auth();
  const token = (session?.user as any)?.accessToken as string;
  const orders = await apiClient.get<PurchaseOrder[]>('/api/orders', token);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <Link
          href="/buyer/orders/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          + New Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="py-24 text-center text-gray-500">
          <p>No orders yet.</p>
          <Link href="/buyer/catalog" className="mt-2 inline-block text-blue-600 hover:underline text-sm">
            Browse catalog →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">PO Number</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Seller</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Items</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium">{order.poNumber}</td>
                  <td className="px-4 py-3 text-gray-700">{order.sellerId}</td>
                  <td className="px-4 py-3 text-gray-600">{order.items.length} item(s)</td>
                  <td className="px-4 py-3">
                    <POStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(order.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/buyer/orders/${order.id}`}
                      className="text-blue-600 hover:underline text-xs font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
