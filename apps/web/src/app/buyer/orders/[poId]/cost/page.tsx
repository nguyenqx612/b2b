import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Props { params: Promise<{ poId: string }> }

interface CostBreakdown {
  id: string;
  poId: string;
  goodsFobCents: number;
  freightCents: number;
  insuranceCents: number;
  customsDutyCents: number;
  portHandlingCents: number;
  otherCents: number;
  totalLandedCents: number;
  currency: string;
  notes?: string;
  createdAt: string;
}

function usd(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export default async function CostBreakdownPage({ params }: Props) {
  const { poId } = await params;
  const session = await auth();
  const token = (session?.user as any)?.accessToken as string;

  let breakdown: CostBreakdown | null = null;
  let fetchError = '';

  try {
    breakdown = await apiClient.get<CostBreakdown | null>(`/api/costs/${poId}`, token);
  } catch {
    fetchError = 'Could not load cost breakdown.';
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/buyer/orders/${poId}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to order
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Landed Cost Breakdown</h1>
        <p className="text-sm text-gray-500 mt-1">
          Full cost from factory to your door — entered by the seller.
        </p>
      </div>

      {fetchError && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {fetchError}
        </div>
      )}

      {!breakdown && !fetchError && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <div className="text-4xl mb-3">💰</div>
          <p className="font-medium text-gray-700">No cost breakdown yet</p>
          <p className="text-sm text-gray-400 mt-1">
            The seller hasn&apos;t entered the cost breakdown for this order yet.
            Check back after the order is confirmed.
          </p>
        </div>
      )}

      {breakdown && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {/* Cost rows */}
          <div className="divide-y divide-gray-100">
            {[
              { label: 'Goods (FOB)',         value: breakdown.goodsFobCents },
              { label: 'Ocean Freight',        value: breakdown.freightCents },
              { label: 'Insurance',            value: breakdown.insuranceCents },
              { label: 'Customs Duty & Taxes', value: breakdown.customsDutyCents },
              { label: 'Port Handling',        value: breakdown.portHandlingCents },
              { label: 'Other Charges',        value: breakdown.otherCents },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-6 py-3.5 text-sm">
                <span className="text-gray-600">{label}</span>
                <span className={`font-medium tabular-nums ${value === 0 ? 'text-gray-300' : 'text-gray-900'}`}>
                  {usd(value)}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <span className="font-semibold text-gray-900">Total Landed Cost</span>
            <span className="text-xl font-bold text-blue-700 tabular-nums">
              {usd(breakdown.totalLandedCents)}
            </span>
          </div>

          {breakdown.notes && (
            <div className="px-6 py-4 border-t border-gray-100 bg-amber-50">
              <p className="text-xs font-medium text-amber-800 mb-1">Seller notes</p>
              <p className="text-sm text-amber-900 whitespace-pre-wrap">{breakdown.notes}</p>
            </div>
          )}

          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">
              Last updated {new Date(breakdown.createdAt).toLocaleString()} · All amounts in {breakdown.currency}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
