import { getSessionToken } from '@/lib/session';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import type { PurchaseOrder } from '@b2b/shared';
import { POStatusBadge } from '@/components/orders/POStatusBadge';

export default async function BuyerOrdersPage() {
  const token = await getSessionToken();
  const orders = await apiClient.get<PurchaseOrder[]>('/api/orders', token);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <Link
          href="/buyer/orders/new"
          className="rounded-md bg-[#062423] px-4 py-2 text-sm font-semibold text-white hover:bg-[#547475] transition"
        >
          + New Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="py-24 text-center text-gray-500">
          <p>No orders yet.</p>
          <Link href="/buyer/vendors" className="mt-2 inline-block text-[#062423] hover:underline text-sm">
            Browse vendor catalogs →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#A8BEBD]/30 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-[#F2EFF5]">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[#547475]">PO Number</th>
                <th className="px-4 py-3 text-left font-medium text-[#547475]">Seller</th>
                <th className="px-4 py-3 text-left font-medium text-[#547475]">Items</th>
                <th className="px-4 py-3 text-left font-medium text-[#547475]">Status</th>
                <th className="px-4 py-3 text-left font-medium text-[#547475]">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#A8BEBD]/15">
                  <td className="px-4 py-3 font-mono font-medium">{order.poNumber}</td>
                  <td className="px-4 py-3 text-gray-700">{order.seller?.companyName ?? order.seller?.email ?? order.sellerId}</td>
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
                      className="text-[#062423] hover:underline text-xs font-medium"
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
