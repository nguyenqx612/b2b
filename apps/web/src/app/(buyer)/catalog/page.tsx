import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import type { ProductBuyerView } from '@b2b/shared';
import { ProductCard } from '@/components/catalog/ProductCard';

interface Props {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}

export default async function BuyerCatalogPage({ searchParams }: Props) {
  const session = await auth();
  const token = (session?.user as any)?.accessToken as string;
  const params = await searchParams;

  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.search) qs.set('search', params.search);
  if (params.page) qs.set('page', params.page);

  const { items, total, page, pageSize } = await apiClient.get<{
    items: ProductBuyerView[];
    total: number;
    page: number;
    pageSize: number;
  }>(`/api/products?${qs}`, token);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Product Catalog</h1>
        <span className="text-sm text-gray-500">{total} products</span>
      </div>

      {/* Search + Filter — can be a client component */}
      <form method="GET" className="flex gap-3 mb-6">
        <input
          name="search"
          defaultValue={params.search}
          placeholder="Search products…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="category"
          defaultValue={params.category}
          placeholder="Category"
          className="w-40 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>

      {items.length === 0 ? (
        <div className="py-24 text-center text-gray-500">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <a
              href={`?page=${page - 1}${params.search ? `&search=${params.search}` : ''}${params.category ? `&category=${params.category}` : ''}`}
              className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100"
            >
              ← Prev
            </a>
          )}
          <span className="px-3 py-1 text-sm text-gray-600">Page {page}</span>
          {page * pageSize < total && (
            <a
              href={`?page=${page + 1}${params.search ? `&search=${params.search}` : ''}${params.category ? `&category=${params.category}` : ''}`}
              className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100"
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
