import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getSessionToken } from '@/lib/session';
import type { ProductBuyerView } from '@b2b/shared';
import { fetchBuyerProduct, fetchMyVendors } from '@/lib/vendor-api';
import { formatCentsRange } from '@/lib/utils';
import { pagePadding } from '@/lib/design-tokens';
import { vendorCatalogPath } from '@/lib/routes';
import { Package, Tag, ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string; id: string }>;
}

export default async function VendorProductDetailPage({ params }: Props) {
  const { slug, id } = await params;
  const session = await auth();
  const token = await getSessionToken();

  const { items: vendors } = await fetchMyVendors(token);
  const vendor = vendors.find((v) => v.slug === slug);
  if (!vendor) notFound();

  let product: ProductBuyerView;
  try {
    product = await fetchBuyerProduct(token, id);
  } catch {
    notFound();
  }

  if (product.sellerId !== vendor.sellerId) notFound();

  const sellerName = product.seller?.companyName ?? vendor.displayName;
  const imageKey = product.images?.[0];

  return (
    <div className={`${pagePadding} space-y-6 py-6`}>
      <Link
        href={vendorCatalogPath(slug)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {vendor.displayName}
      </Link>

      <div className="grid gap-8 rounded-2xl border border-border bg-card p-6 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {imageKey ? (
            <img
              src={`/api/image-proxy?key=${encodeURIComponent(imageKey)}`}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="mb-2 inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            {product.category}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{product.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sold by <span className="font-medium text-foreground">{sellerName}</span>
          </p>

          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          )}

          <div className="my-6 h-px bg-border" />

          <div className="mb-4">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Indicative price</div>
            <div className="mt-1 text-2xl font-bold text-foreground">
              {formatCentsRange(product.priceRangeMin, product.priceRangeMax)}
              <span className="ml-2 text-base font-normal text-muted-foreground">/ {product.unit}</span>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
              <Package className="h-3 w-3" />
              {Number(product.cbmPerUnit).toFixed(4)} CBM per unit
            </span>
            {product.hsCode && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" />
                HS {product.hsCode}
              </span>
            )}
          </div>

          <div className="mt-auto">
            <Link
              href={`/buyer/orders/new?sellerId=${product.sellerId}`}
              className="block w-full rounded-xl bg-accent px-6 py-3 text-center text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              Start purchase order →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
