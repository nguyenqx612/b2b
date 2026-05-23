import { auth } from '@/lib/auth';
import { CatalogBrowse } from '@/components/catalog/CatalogBrowse';
import { fetchPublicCategories, fetchPublicProducts } from '@/lib/public-api';
import { pagePadding } from '@/lib/design-tokens';

interface Props {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams;
  const session = await auth();

  const [{ items, total, page, pageSize }, { categories }] = await Promise.all([
    fetchPublicProducts(params),
    fetchPublicCategories(),
  ]);

  return (
    <div className={`${pagePadding} py-6`}>
      <CatalogBrowse
        items={items}
        total={total}
        page={page}
        pageSize={pageSize}
        categories={categories}
        params={params}
        viewerRole={session?.user?.role ?? null}
        viewerId={session?.user?.id ?? null}
      />
    </div>
  );
}
