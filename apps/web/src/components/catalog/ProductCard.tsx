import Link from 'next/link';
import type { ProductBuyerView } from '@b2b/shared';
import { formatCentsRange } from '@/lib/utils';
import { Package, Tag } from 'lucide-react';

interface Props {
  product: ProductBuyerView;
  onAddToOrder?: (product: ProductBuyerView) => void;
}

/** Deterministic gradient per category so cards look varied even with no images */
function placeholderGradient(category: string): string {
  const palettes = [
    { from: '#062423', to: '#547475' },
    { from: '#547475', to: '#A8BEBD' },
    { from: '#0E0E0F', to: '#547475' },
    { from: '#062423', to: '#A8BEBD' },
    { from: '#547475', to: '#062423' },
    { from: '#A8BEBD', to: '#062423' },
  ];
  const idx =
    category.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % palettes.length;
  const { from, to } = palettes[idx];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

/** Small icon rendered on top of placeholder */
function PlaceholderIcon() {
  return <Package className="h-10 w-10 opacity-30 text-white" />;
}

export function ProductCard({ product, onAddToOrder }: Props) {
  // Support both shapes: product.sellerCompany (typed) or product.seller.companyName (runtime)
  const sellerName =
    (product as any).seller?.companyName ?? product.sellerCompany ?? 'Unknown Seller';

  const orderHref = `/buyer/orders/new?sellerId=${product.sellerId}`;

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#A8BEBD]/30 bg-white
                 shadow-sm transition-all duration-200
                 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#062423]/10 hover:border-[#A8BEBD]"
    >
      {/* ── Image / Placeholder ─────────────────────────── */}
      <div className="relative aspect-[4/3] overflow-hidden">
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
            <PlaceholderIcon />
          </div>
        )}

        {/* Category badge — overlaid bottom-left */}
        <div className="absolute bottom-3 left-3">
          <span
            className="inline-block rounded-full bg-[#062423]/80 px-2.5 py-1
                       text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm"
          >
            {product.category}
          </span>
        </div>

        {/* Origin badge — top-right */}
        <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-[#062423] backdrop-blur-sm shadow-sm">
            🇻🇳 {product.originCountry ?? 'Vietnam'}
          </span>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4">

        {/* Name + seller */}
        <div className="mb-3">
          <h3 className="line-clamp-2 font-semibold leading-snug text-[#062423]">
            {product.name}
          </h3>
          <p className="mt-0.5 text-xs text-[#547475]">
            by{' '}
            <span className="font-medium text-[#547475]">{sellerName}</span>
          </p>
        </div>

        {product.description && (
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-[#547475]/80">
            {product.description}
          </p>
        )}

        {/* ── Divider ─────────────────────────────────── */}
        <div className="mb-3 h-px bg-[#A8BEBD]/30" />

        {/* Price range */}
        <div className="mb-3">
          <div className="text-[10px] font-medium uppercase tracking-wider text-[#A8BEBD]">
            Indicative price
          </div>
          <div className="mt-0.5 text-base font-bold text-[#062423]">
            {formatCentsRange(product.priceRangeMin, product.priceRangeMax)}
            <span className="ml-1 text-xs font-normal text-[#547475]">/ {product.unit}</span>
          </div>
        </div>

        {/* Metadata chips */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          <MetaChip
            icon={<Package className="h-3 w-3" />}
            label={`${Number(product.cbmPerUnit).toFixed(4)} CBM`}
          />
          {product.hsCode && (
            <MetaChip
              icon={<Tag className="h-3 w-3" />}
              label={`HS ${product.hsCode}`}
            />
          )}
        </div>

        {/* ── CTA ─────────────────────────────────────── */}
        <div className="mt-auto">
          {onAddToOrder ? (
            <button
              onClick={() => onAddToOrder(product)}
              className="w-full rounded-xl bg-[#062423] px-4 py-2.5 text-sm font-semibold text-white
                         transition-colors hover:bg-[#547475]
                         active:scale-[0.98]"
            >
              Add to Order
            </button>
          ) : (
            <Link
              href={orderHref}
              className="block w-full rounded-xl bg-[#062423] px-4 py-2.5 text-center text-sm font-semibold text-white
                         transition-colors hover:bg-[#547475]
                         active:scale-[0.98]"
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
    <span className="inline-flex items-center gap-1 rounded-full border border-[#A8BEBD]/40 bg-[#F2EFF5] px-2 py-0.5 text-[10px] font-medium text-[#547475]">
      {icon}
      {label}
    </span>
  );
}
