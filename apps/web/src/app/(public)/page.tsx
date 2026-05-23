import Link from 'next/link';
import { auth } from '@/lib/auth';
import { CatalogBrowse } from '@/components/catalog/CatalogBrowse';
import { CategoryStrip, LandingContent } from '@/components/landing/LandingContent';
import { fetchPublicCategories, fetchPublicProducts } from '@/lib/public-api';
import { pagePadding } from '@/lib/design-tokens';
import { PUBLIC_CATALOG } from '@/lib/routes';

export default async function HomePage() {
  const session = await auth();
  const [{ items, total, page, pageSize }, { categories }] = await Promise.all([
    fetchPublicProducts({ pageSize: '8' }),
    fetchPublicCategories(),
  ]);

  return (
    <>
      <LandingContent />
      <CategoryStrip categories={categories} />
      <section className={`${pagePadding} py-12`}>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Featured products</h2>
            <p className="mt-1 text-sm text-muted-foreground">Handpicked exports from verified Vietnamese sellers</p>
          </div>
          <Link href={PUBLIC_CATALOG} className="text-sm font-semibold text-primary hover:text-secondary hover:underline">
            Browse all →
          </Link>
        </div>
        <CatalogBrowse
          items={items}
          total={total}
          page={page}
          pageSize={pageSize}
          categories={categories}
          params={{}}
          viewerRole={session?.user?.role ?? null}
          viewerId={session?.user?.id ?? null}
          compact
        />
      </section>
    </>
  );
}
