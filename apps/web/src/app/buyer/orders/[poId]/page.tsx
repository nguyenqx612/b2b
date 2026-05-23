import { getSessionToken } from '@/lib/session';
import { apiClient } from '@/lib/api-client';
import type { PurchaseOrder, POVersion } from '@b2b/shared';
import { POStatusBadge } from '@/components/orders/POStatusBadge';
import { POLineItems } from '@/components/orders/POLineItems';
import { POVersionHistory } from '@/components/orders/POVersionHistory';
import { MessageThread } from '@/components/messaging/MessageThread';
import Link from 'next/link';

interface Props { params: Promise<{ poId: string }> }

interface OrderMessage {
  id: string;
  senderId: string;
  messageType: 'text' | 'file' | 'system';
  body: string | null;
  fileName: string | null;
  fileS3Key: string | null;
  sender: { email: string; companyName: string | null; role: string };
  createdAt: string;
}

export default async function BuyerOrderDetailPage({ params }: Props) {
  const { poId } = await params;
  const token = await getSessionToken();

  const [order, versions, messages] = await Promise.all([
    apiClient.get<PurchaseOrder>(`/api/orders/${poId}`, token),
    apiClient.get<POVersion[]>(`/api/orders/${poId}/versions`, token),
    apiClient.get<OrderMessage[]>(`/api/messages/${poId}`, token),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/buyer/orders" className="text-sm text-[#547475] hover:text-[#062423]">← Back to orders</Link>
          <h1 className="mt-1 text-2xl font-bold">{order.poNumber}</h1>
          <div className="mt-1 flex items-center gap-3">
            <POStatusBadge status={order.status} />
            <span className="text-xs text-[#547475]">Version {order.currentVersion}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/buyer/orders/${poId}/container`}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-[#A8BEBD]/15 transition">
            📦 Container Sim
          </Link>
          <Link href={`/buyer/orders/${poId}/docs`}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-[#A8BEBD]/15 transition">
            📄 Documents
          </Link>
          <Link href={`/buyer/orders/${poId}/cost`}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-[#A8BEBD]/15 transition">
            💰 Cost Breakdown
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main: line items + version history */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-[#A8BEBD]/30 bg-white p-6">
            <h2 className="font-semibold mb-4">Order Details</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm mb-6">
              <div><dt className="text-gray-500">Shipping Terms</dt><dd className="font-medium">{order.shippingTerms ?? '—'}</dd></div>
              <div><dt className="text-gray-500">Port of Loading</dt><dd className="font-medium">{order.portOfLoading ?? '—'}</dd></div>
              <div><dt className="text-gray-500">Port of Discharge</dt><dd className="font-medium">{order.portOfDischarge ?? '—'}</dd></div>
              <div><dt className="text-gray-500">Created</dt><dd className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</dd></div>
            </dl>
            <POLineItems items={order.items} />
          </div>

          <POVersionHistory versions={versions} />
        </div>

        {/* Sidebar: messaging */}
        <div className="lg:col-span-1">
          <MessageThread poId={poId} initialMessages={messages} token={token} />
        </div>
      </div>
    </div>
  );
}
