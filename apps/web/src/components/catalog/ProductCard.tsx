import Link from 'next/link';
import type { ProductBuyerView, Role } from '@b2b/shared';
import { formatCentsRange } from '@/lib/utils';
import { Package, Tag } from 'lucide-react';

interface Props {
  product: ProductBuyerView;
  onAddToOrder?: (product: ProductBuyerView) => void;
  viewerRole?: Role | null;
  viewerId?: string | null;
}

function placeholderGradient(category: string): string {
  const palettes = [
    { from: '#1B4965', to: '#62B6CB' },
    { from: '#2A628F', to: '#89C9D9' },
    { from: '#133047', to: '#62B6CB' },
    { from: '#1B4965', to: '#F4A261' },
    { from: '#62B6CB', to: '#1B4965' },
    { from: '#F4A261', to: '#2A628F' },
  ];
  const idx = category.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % palettes.length;
  const { from, to } = palettes[idx];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

function buildOrderHref(sellerId: string, viewerRole?: Role | null) {
  const orderPath = `/buyer/orders/new?sellerId=${sellerId}`;
  if (viewerRole === 'buyer' || viewerRole === 'admin') return orderPath;
  return `/auth/login?callbackUrl=${encodeURIComponent(orderPath)}`;
}

export function ProductCard({ product, onAddToOrder, viewerRole = null, viewerId = null }: Props) {
  const sellerName = product.seller?.companyName ?? 'Unknown Seller';
  const isOwnProduct = viewerRole === 'seller' && viewerId === product.sellerId;
  const detailHref = `/catalog/${product.id}`;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <Link href={detailHref} className="relative aspect-[4/3] overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={`/api/image-proxy?key=${encodeURIComponent(product.images[0])}`}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105"
            style={{ background: placeholderGradient(product.category) }}
          >
            <Package className="h-10 w-10 text-white opacity-40" />
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <span className="inline-block rounded-full bg-primary/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground backdrop-blur-sm">
            {product.category}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3">
          <Link href={detailHref}>
            <h3 className="line-clamp-2 font-semibold leading-snug text-foreground hover:text-primary hover:underline">
              {product.name}
            </h3>
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">
            by <span className="font-medium">{sellerName}</span>
          </p>
        </div>

        {product.description && (
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{product.description}</p>
        )}

        <div className="mb-3 h-px bg-border" />

        <div className="mb-3">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Indicative price</div>
          <div className="mt-0.5 text-base font-bold text-foreground">
            {formatCentsRange(product.priceRangeMin, product.priceRangeMax)}
            <span className="ml-1 text-xs font-normal text-muted-foreground">/ {product.unit}</span>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          <MetaChip icon={<Package className="h-3 w-3" />} label={`${Number(product.cbmPerUnit).toFixed(4)} CBM`} />
          {product.hsCode && <MetaChip icon={<Tag className="h-3 w-3" />} label={`HS ${product.hsCode}`} />}
        </div>

        <div className="mt-auto">
          {onAddToOrder ? (
            <button
              onClick={() => onAddToOrder(product)}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 active:scale-[0.98]"
            >
              Add to Order
            </button>
          ) : isOwnProduct ? (
            <Link
              href={`/seller/catalog/${product.id}/edit`}
              className="block w-full rounded-xl border border-border px-4 py-2.5 text-center text-sm font-semibold text-primary transition-colors hover:bg-muted"
            >
              Manage listing
            </Link>
          ) : viewerRole === 'seller' ? (
            <span className="block w-full rounded-xl border border-dashed border-border px-4 py-2.5 text-center text-sm text-muted-foreground">
              View only
            </span>
          ) : (
            <Link
              href={buildOrderHref(product.sellerId, viewerRole)}
              className="block w-full rounded-xl bg-accent px-4 py-2.5 text-center text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90 active:scale-[0.98]"
            >
              Order Now →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
      {icon}
      {label}
    </span>
  );
}
