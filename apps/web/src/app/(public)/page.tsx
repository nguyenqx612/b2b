import { LandingContent } from '@/components/landing/LandingContent';
import { VendorGrid } from '@/components/vendor/VendorGrid';
import { apiClient } from '@/lib/api-client';
import type { VendorListItem } from '@b2b/shared';
import { pagePadding } from '@/lib/design-tokens';

export default async function HomePage() {
  let vendors: VendorListItem[] = [];
  try {
    const data = await apiClient.get<{ items: VendorListItem[] }>('/api/vendors');
    vendors = data.items;
  } catch {
    // API may be unavailable before seed
  }

  return (
    <>
      <LandingContent />
      <section id="vendors" className={`${pagePadding} scroll-mt-24 py-12`}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Manufacturers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Public overview only — wholesale catalogs require approved access
          </p>
        </div>
        <VendorGrid vendors={vendors} />
      </section>
    </>
  );
}
