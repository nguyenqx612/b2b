import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { fetchVendorTeaser, fetchVendorLinkStatus } from '@/lib/vendor-api';
import { getSessionToken } from '@/lib/session';
import { VendorAccessRequest } from '@/components/vendor/VendorAccessRequest';
import { pagePadding } from '@/lib/design-tokens';
import { ExternalLink } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function VendorTeaserPage({ params }: Props) {
  const { slug } = await params;

  let teaser;
  try {
    teaser = await fetchVendorTeaser(slug);
  } catch {
    notFound();
  }

  const session = await auth();
  let linkStatus: string | null = null;
  if (session?.user?.role === 'buyer') {
    try {
      const token = await getSessionToken();
      const { link } = await fetchVendorLinkStatus(token, slug);
      linkStatus = link?.status ?? null;
    } catch {
      linkStatus = null;
    }
  }

  return (
    <div className={`${pagePadding} space-y-8 py-10`}>
      <div className="rounded-2xl border border-border bg-card p-8 lg:p-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Verified manufacturer</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-foreground">{teaser.displayName}</h1>
        {teaser.tagline && <p className="mt-3 text-lg text-muted-foreground">{teaser.tagline}</p>}

        {teaser.about && (
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">{teaser.about}</p>
        )}

        {teaser.websiteUrl && (
          <a
            href={teaser.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Visit public website
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        <div className="mt-8 border-t border-border pt-8">
          <h2 className="text-sm font-semibold text-foreground">Product categories</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Overview only — SKUs, pricing, and images are available after approval
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {teaser.teaserCategories.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-border bg-muted px-4 py-2 text-xs font-semibold text-foreground"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <VendorAccessRequest slug={slug} initialStatus={linkStatus} />
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Powered by{' '}
        <Link href="/" className="font-medium text-primary hover:underline">
          HarborLane
        </Link>
      </p>
    </div>
  );
}
