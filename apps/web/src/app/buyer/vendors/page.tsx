import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getSessionToken } from '@/lib/session';
import { fetchMyVendors, fetchPublishedVendors } from '@/lib/vendor-api';
import { vendorCatalogPath, vendorTeaserPath } from '@/lib/routes';
import { pagePadding } from '@/lib/design-tokens';
import { Store, Clock } from 'lucide-react';

export default async function BuyerVendorsPage() {
  const token = await getSessionToken();
  const [{ items, pending }, { items: allVendors }] = await Promise.all([
    fetchMyVendors(token),
    fetchPublishedVendors().catch(() => ({ items: [] })),
  ]);

  return (
    <div className={`${pagePadding} space-y-8 py-6`}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">My vendors</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Private wholesale catalogs from manufacturers you&apos;re connected with
        </p>
      </div>

      {pending.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-secondary" />
            <h2 className="text-lg font-semibold text-foreground">Pending requests</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map((vendor) => (
              <Link
                key={vendor.linkId}
                href={vendorTeaserPath(vendor.slug)}
                className="rounded-2xl border border-dashed border-secondary/40 bg-card p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Awaiting approval</p>
                <h3 className="mt-2 text-xl font-bold text-foreground">{vendor.displayName}</h3>
                {vendor.tagline && <p className="mt-2 text-sm text-muted-foreground">{vendor.tagline}</p>}
                <p className="mt-4 text-sm text-muted-foreground">Requested {new Date(vendor.createdAt).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
          <Store className="mb-4 h-10 w-10 text-muted-foreground" />
          <p className="font-semibold text-foreground">No approved vendor connections yet</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Request access from a manufacturer profile below, or ask HarborLane to connect you.
          </p>
        </div>
      ) : (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Approved vendors</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((vendor) => (
              <Link
                key={vendor.sellerId}
                href={vendorCatalogPath(vendor.slug)}
                className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Vendor</p>
                <h2 className="mt-2 text-xl font-bold text-foreground">{vendor.displayName}</h2>
                {vendor.tagline && <p className="mt-2 text-sm text-muted-foreground">{vendor.tagline}</p>}
                <p className="mt-4 text-sm font-semibold text-primary">Browse catalog →</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Discover manufacturers</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allVendors.map((vendor) => (
            <Link
              key={vendor.slug}
              href={vendorTeaserPath(vendor.slug)}
              className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <h3 className="text-lg font-bold text-foreground">{vendor.displayName}</h3>
              {vendor.tagline && <p className="mt-1 text-sm text-muted-foreground">{vendor.tagline}</p>}
              <p className="mt-3 text-sm font-semibold text-primary">View profile →</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
