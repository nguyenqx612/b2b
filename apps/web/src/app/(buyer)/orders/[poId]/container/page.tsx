'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { ContainerSimResult } from '@b2b/shared';

export default function ContainerSimPage() {
  const { poId } = useParams<{ poId: string }>();
  const [result, setResult] = useState<ContainerSimResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function runSimulation() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/proxy/container/${poId}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ containerType: '40ft' }),
      });
      if (!res.ok) throw new Error('Simulation failed');
      const data = await res.json();
      setResult(data.simulation);
    } catch (e) {
      setError('Failed to run simulation. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const utilizationPct = result?.utilizationPct ?? 0;
  const barColor =
    utilizationPct >= 90 ? 'bg-green-500' :
    utilizationPct >= 60 ? 'bg-amber-500' : 'bg-blue-500';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href={`/buyer/orders/${poId}`} className="text-sm text-gray-500 hover:text-gray-700">← Back to order</Link>
        <h1 className="mt-1 text-2xl font-bold">Container Simulation</h1>
        <p className="text-gray-500 text-sm mt-1">40ft standard container — 67.3 CBM capacity</p>
      </div>

      <button
        onClick={runSimulation}
        disabled={loading}
        className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition"
      >
        {loading ? 'Calculating…' : 'Run Simulation'}
      </button>

      {error && <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      {result && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
          {/* Utilization bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Container Utilization</span>
              <span className="font-bold text-lg">{utilizationPct.toFixed(1)}%</span>
            </div>
            <div className="h-6 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${Math.min(utilizationPct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0 CBM</span>
              <span>67.3 CBM</span>
            </div>
          </div>

          {/* Summary */}
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg bg-gray-50 p-4">
              <dt className="text-gray-500 text-xs">Total Volume</dt>
              <dd className="text-xl font-bold text-gray-900">{result.totalCBM.toFixed(3)} <span className="text-sm font-normal text-gray-500">CBM</span></dd>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <dt className="text-gray-500 text-xs">Containers Needed</dt>
              <dd className="text-xl font-bold text-gray-900">{result.containersNeeded.toFixed(2)}</dd>
              <dd className="text-xs text-gray-500">{result.fullContainers} full + {result.remainderCBM.toFixed(3)} CBM overflow</dd>
            </div>
          </dl>

          {/* Item breakdown */}
          <div>
            <h3 className="font-medium text-sm mb-3">Item Breakdown</h3>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500 text-xs">
                  <th className="pb-2">Product</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">CBM/unit</th>
                  <th className="pb-2 text-right">Total CBM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.items.map((item) => (
                  <tr key={item.productId}>
                    <td className="py-2">{item.name}</td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right text-gray-500">{item.cbmPerUnit}</td>
                    <td className="py-2 text-right font-medium">{item.subtotalCBM.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
