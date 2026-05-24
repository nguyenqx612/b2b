import Link from 'next/link';
import type { VendorListItem } from '@b2b/shared';
import { vendorTeaserPath } from '@/lib/routes';

export function VendorGrid({ vendors }: { vendors: VendorListItem[] }) {
  if (vendors.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No published manufacturers yet.</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {vendors.map((vendor) => (
        <Link
          key={vendor.slug}
          href={vendorTeaserPath(vendor.slug)}
          className="block rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
        >
          {vendor.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vendor.logoUrl} alt="" className="mb-3 h-10 w-auto object-contain" />
          ) : (
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-secondary">Manufacturer</p>
          )}
          <h3 className="text-xl font-bold text-foreground">{vendor.displayName}</h3>
          {vendor.tagline && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{vendor.tagline}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {vendor.teaserCategories.slice(0, 4).map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {cat}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold text-primary">View profile →</p>
        </Link>
      ))}
    </div>
  );
}
