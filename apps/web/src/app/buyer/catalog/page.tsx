import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import type { ProductBuyerView } from '@b2b/shared';
import { ProductCard } from '@/components/catalog/ProductCard';
import Link from 'next/link';
import { Search, Package } from 'lucide-react';

interface Props {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}

export default async function BuyerCatalogPage({ searchParams }: Props) {
  const session = await auth();
  const token = (session?.user as any)?.accessToken as string;
  const params = await searchParams;

  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.search)   qs.set('search',   params.search);
  if (params.page)     qs.set('page',      params.page);

  const [{ items, total, page, pageSize }, { categories }] = await Promise.all([
    apiClient.get<{ items: ProductBuyerView[]; total: number; page: number; pageSize: number }>(
      `/api/products?${qs}`, token,
    ),
    apiClient.get<{ categories: string[] }>(
      '/api/products/categories', token,
    ),
  ]);

  const totalPages  = Math.ceil(total / pageSize);

  function href(ov: Record<string, string | undefined>) {
    const n = { search: params.search, category: params.category, page: params.page, ...ov };
    const p = new URLSearchParams();
    if (n.search)               p.set('search',   n.search);
    if (n.category)             p.set('category', n.category);
    if (n.page && n.page !== '1') p.set('page',   n.page);
    return `?${p}`;
  }

  return (
    <div className="space-y-5">

      {/* ── Hero card ──────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#062423] px-7 py-9">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[#547475] opacity-20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-[#A8BEBD] opacity-10 blur-2xl" />

        <div className="relative">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A8BEBD] animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#A8BEBD]">
              Vietnam Export Marketplace
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Product Marketplace
              </h1>
              <p className="mt-1 text-sm text-[#A8BEBD]">
                {total} verified product{total !== 1 ? 's' : ''} from trusted Vietnamese exporters
              </p>
            </div>
            <div className="flex gap-3">
              {[{ v: total, l: 'Products' }, { v: categories.length, l: 'Categories' }].map(({ v, l }) => (
                <div key={l} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center backdrop-blur">
                  <div className="text-lg font-bold text-white">{v}</div>
                  <div className="text-[10px] text-[#A8BEBD]">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <form method="GET" className="mt-5 flex gap-2 max-w-2xl">
            {params.category && <input type="hidden" name="category" value={params.category} />}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#547475]" />
              <input
                name="search"
                defaultValue={params.search}
                placeholder="Search products, HS codes, categories…"
                className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-10 pr-4 text-sm text-white
                           placeholder-[#547475] backdrop-blur focus:outline-none focus:ring-2 focus:ring-[#A8BEBD]/60"
              />
            </div>
            <button type="submit"
              className="flex-shrink-0 rounded-xl bg-[#547475] px-5 py-3 text-sm font-semibold text-white
                         hover:bg-[#A8BEBD] hover:text-[#062423] transition-colors">
              Search
            </button>
            {(params.search || params.category) && (
              <Link href="?"
                className="flex flex-shrink-0 items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3
                           text-sm text-[#A8BEBD] hover:bg-white/10 transition-colors">
                Clear
              </Link>
            )}
          </form>
        </div>
      </div>

      {/* ── Category pills ─────────────────────────────── */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link href={href({ category: undefined, page: undefined })}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              !params.category
                ? 'bg-[#062423] text-white shadow-sm'
                : 'border border-[#A8BEBD] bg-white text-[#547475] hover:border-[#547475] hover:text-[#062423]'
            }`}>
            All
          </Link>
          {categories.map((cat) => (
            <Link key={cat} href={href({ category: cat, page: undefined })}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                params.category === cat
                  ? 'bg-[#062423] text-white shadow-sm'
                  : 'border border-[#A8BEBD] bg-white text-[#547475] hover:border-[#547475] hover:text-[#062423]'
              }`}>
              {cat}
            </Link>
          ))}
        </div>
      )}

      {/* ── Results bar ────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#547475]">
          <span className="font-semibold text-[#062423]">{total}</span>
          {params.category || params.search ? ' result' : ' product'}{total !== 1 ? 's' : ''}
          {params.category && <> in <span className="font-medium text-[#062423]">{params.category}</span></>}
          {params.search && <> for &ldquo;<span className="font-medium text-[#062423]">{params.search}</span>&rdquo;</>}
        </p>
        {totalPages > 1 && (
          <span className="text-xs text-[#547475]">Page {page} / {totalPages}</span>
        )}
      </div>

      {/* ── Grid ───────────────────────────────────────── */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#A8BEBD] bg-white py-24 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A8BEBD]/20">
            <Package className="h-6 w-6 text-[#547475]" />
          </div>
          <p className="mb-1 font-semibold text-[#062423]">No products found</p>
          <p className="mb-5 text-sm text-[#547475]">Adjust your search or browse all categories.</p>
          <Link href="?" className="rounded-lg bg-[#062423] px-5 py-2 text-sm font-semibold text-white hover:bg-[#547475] transition-colors">
            Browse all
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2">
          {page > 1 && (
            <a href={href({ page: String(page - 1) })}
              className="rounded-lg border border-[#A8BEBD] bg-white px-4 py-2 text-sm font-medium text-[#547475]
                         hover:border-[#062423] hover:bg-[#062423] hover:text-white transition-colors">
              ← Prev
            </a>
          )}
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = totalPages <= 7 ? i + 1
              : page <= 4 ? i + 1
              : page >= totalPages - 3 ? totalPages - 6 + i
              : page - 3 + i;
            return (
              <a key={p} href={href({ page: String(p) })}
                className={`min-w-[2.25rem] rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-[#062423] text-white shadow-sm'
                    : 'border border-[#A8BEBD] bg-white text-[#547475] hover:border-[#062423] hover:text-[#062423]'
                }`}>
                {p}
              </a>
            );
          })}
          {page < totalPages && (
            <a href={href({ page: String(page + 1) })}
              className="rounded-lg border border-[#A8BEBD] bg-white px-4 py-2 text-sm font-medium text-[#547475]
                         hover:border-[#062423] hover:bg-[#062423] hover:text-white transition-colors">
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
