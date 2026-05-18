import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import type { ProductSellerView } from '@b2b/shared';
import Link from 'next/link';
import { formatCents, formatCentsRange } from '@/lib/utils';

export default async function SellerCatalogPage() {
  const session = await auth();
  const token = (session?.user as any)?.accessToken as string;

  const { items: products } = await apiClient.get<{ items: ProductSellerView[]; total: number }>(
    '/api/products',
    token,
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Link
          href="/seller/catalog/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="py-24 text-center text-gray-500">
          <p>No products yet.</p>
          <Link href="/seller/catalog/new" className="mt-2 inline-block text-blue-600 hover:underline text-sm">
            Add your first product →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Product</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">SKU</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Unit Price</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Buyer Range</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">CBM/unit</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.name}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                  <td className="px-4 py-3 text-gray-600">{p.category}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {formatCents(p.priceUsdCents)}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-700">
                    {formatCentsRange(p.priceRangeMin, p.priceRangeMax)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">{Number(p.cbmPerUnit).toFixed(4)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/seller/catalog/${p.id}/edit`} className="text-blue-600 hover:underline text-xs">Edit</Link>
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
