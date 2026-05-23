import Link from 'next/link';
import type { ProductBuyerView, Role } from '@b2b/shared';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Search, Package } from 'lucide-react';

export interface CatalogBrowseParams {
  category?: string;
  search?: string;
  page?: string;
}

interface CatalogBrowseProps {
  items: ProductBuyerView[];
  total: number;
  page: number;
  pageSize: number;
  categories: string[];
  params: CatalogBrowseParams;
  basePath?: string;
  viewerRole?: Role | null;
  viewerId?: string | null;
  compact?: boolean;
}

function buildHref(basePath: string, params: CatalogBrowseParams, overrides: Record<string, string | undefined>) {
  const merged = { ...params, ...overrides };
  const p = new URLSearchParams();
  if (merged.search) p.set('search', merged.search);
  if (merged.category) p.set('category', merged.category);
  if (merged.page && merged.page !== '1') p.set('page', merged.page);
  const qs = p.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function CatalogBrowse({
  items,
  total,
  page,
  pageSize,
  categories,
  params,
  basePath = '/catalog',
  viewerRole = null,
  viewerId = null,
  compact = false,
}: CatalogBrowseProps) {
  const totalPages = Math.ceil(total / pageSize);
  const href = (overrides: Record<string, string | undefined>) => buildHref(basePath, params, overrides);

  return (
    <div className="space-y-5">
      {!compact && (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-primary px-6 py-8 sm:px-8">
          <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />

          <div className="relative">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.18em] text-secondary">
              Vietnam Export Marketplace
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-primary-foreground">Product Marketplace</h1>
                <p className="mt-1 text-sm text-primary-foreground/80">
                  {total} verified product{total !== 1 ? 's' : ''} from trusted Vietnamese exporters
                </p>
              </div>
              <div className="flex gap-3">
                {[{ v: total, l: 'Products' }, { v: categories.length, l: 'Categories' }].map(({ v, l }) => (
                  <div key={l} className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-center backdrop-blur">
                    <div className="text-lg font-bold text-primary-foreground">{v}</div>
                    <div className="text-[10px] text-primary-foreground/70">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <form method="GET" action={basePath} className="mt-5 flex max-w-2xl gap-2">
              {params.category && <input type="hidden" name="category" value={params.category} />}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="search"
                  defaultValue={params.search}
                  placeholder="Search products, HS codes, categories…"
                  className="w-full rounded-xl border border-white/20 bg-white py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/60"
                />
              </div>
              <button
                type="submit"
                className="flex-shrink-0 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90"
              >
                Search
              </button>
              {(params.search || params.category) && (
                <Link
                  href={basePath}
                  className="flex flex-shrink-0 items-center rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-primary-foreground transition-colors hover:bg-white/20"
                >
                  Clear
                </Link>
              )}
            </form>
          </div>
        </div>
      )}

      {!compact && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href={href({ category: undefined, page: undefined })}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              !params.category
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={href({ category: cat, page: undefined })}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                params.category === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      )}

      {!compact && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{total}</span>
            {params.category || params.search ? ' result' : ' product'}
            {total !== 1 ? 's' : ''}
            {params.category && (
              <>
                {' '}
                in <span className="font-medium text-foreground">{params.category}</span>
              </>
            )}
            {params.search && (
              <>
                {' '}
                for &ldquo;<span className="font-medium text-foreground">{params.search}</span>&rdquo;
              </>
            )}
          </p>
          {totalPages > 1 && <span className="text-xs text-muted-foreground">Page {page} / {totalPages}</span>}
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-24 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mb-1 font-semibold text-foreground">No products found</p>
          <p className="mb-5 text-sm text-muted-foreground">Adjust your search or browse all categories.</p>
          <Link href={basePath} className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90">
            Browse all
          </Link>
        </div>
      ) : (
        <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${compact ? 'lg:grid-cols-4' : 'lg:grid-cols-3 xl:grid-cols-4'}`}>
          {items.map((p) => (
            <ProductCard key={p.id} product={p} viewerRole={viewerRole} viewerId={viewerId} />
          ))}
        </div>
      )}

      {!compact && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2">
          {page > 1 && (
            <a
              href={href({ page: String(page - 1) })}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              ← Prev
            </a>
          )}
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p =
              totalPages <= 7
                ? i + 1
                : page <= 4
                  ? i + 1
                  : page >= totalPages - 3
                    ? totalPages - 6 + i
                    : page - 3 + i;
            return (
              <a
                key={p}
                href={href({ page: String(p) })}
                className={`min-w-[2.25rem] rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'
                }`}
              >
                {p}
              </a>
            );
          })}
          {page < totalPages && (
            <a
              href={href({ page: String(page + 1) })}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
