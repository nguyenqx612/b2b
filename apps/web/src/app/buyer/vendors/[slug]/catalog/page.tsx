import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getSessionToken } from '@/lib/session';
import type { ProductBuyerView } from '@b2b/shared';
import { fetchBuyerProducts, fetchBuyerProductCategories, fetchMyVendors, fetchVendorTeaser } from '@/lib/vendor-api';
import { CatalogBrowse } from '@/components/catalog/CatalogBrowse';
import { pagePadding } from '@/lib/design-tokens';
import Link from 'next/link';
import { vendorCatalogPath } from '@/lib/routes';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}

export default async function VendorCatalogPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const session = await auth();
  const token = await getSessionToken();

  let teaser;
  try {
    teaser = await fetchVendorTeaser(slug);
  } catch {
    notFound();
  }

  const { items: vendors } = await fetchMyVendors(token);
  const vendor = vendors.find((v) => v.slug === slug);
  if (!vendor) notFound();

  let catalog;
  let categories: string[] = [];
  try {
    const [products, cats] = await Promise.all([
      fetchBuyerProducts(token, {
        sellerId: vendor.sellerId,
        category: sp.category,
        search: sp.search,
        page: sp.page ?? '1',
        pageSize: '20',
      }),
      fetchBuyerProductCategories(token, vendor.sellerId),
    ]);
    catalog = products;
    categories = cats.categories;
  } catch {
    notFound();
  }

  return (
    <div className={`${pagePadding} space-y-6 py-6`}>
      <div>
        <Link href="/buyer/vendors" className="text-sm text-muted-foreground hover:text-primary">
          ← My vendors
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">{teaser.displayName}</h1>
        <p className="text-sm text-muted-foreground">Private wholesale catalog</p>
      </div>

      <CatalogBrowse
        items={catalog.items as ProductBuyerView[]}
        total={catalog.total}
        page={catalog.page}
        pageSize={catalog.pageSize}
        categories={categories}
        params={sp}
        basePath={vendorCatalogPath(slug)}
        vendorSlug={slug}
        viewerRole={session?.user?.role ?? null}
        viewerId={session?.user?.id ?? null}
      />
    </div>
  );
}
