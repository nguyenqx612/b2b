import Link from 'next/link';
import { ShieldCheck, Truck, FileCheck } from 'lucide-react';
import { brand, pagePadding } from '@/lib/design-tokens';
import { PUBLIC_CATALOG } from '@/lib/routes';

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: 'Verified sellers', desc: 'Every exporter vetted before listing.' },
  { icon: Truck, title: 'Container-ready', desc: 'CBM and load data built into every SKU.' },
  { icon: FileCheck, title: 'Export documents', desc: 'C/O, invoices, and packing lists in one place.' },
];

const STEPS = [
  'Browse the marketplace',
  'Build a purchase order',
  'Collaborate & confirm',
  'Generate docs & ship',
];

export function LandingContent() {
  return (
    <div className="w-full">
      <section className={`${pagePadding} border-b border-border bg-card py-12 lg:py-16`}>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-medium text-secondary">{brand.tagline}</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Import from Vietnam
              <span className="text-primary"> without the email chaos</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Browse products publicly, then sign in to manage orders, negotiate in real time, and generate export
              documents — all on one platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={PUBLIC_CATALOG}
                className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                Browse marketplace
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Create free account
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/50 p-6">
            <p className="mb-4 text-sm font-semibold text-foreground">How it works</p>
            <ol className="space-y-3">
              {STEPS.map((step, i) => (
                <li key={step} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className={`${pagePadding} py-10`}>
        <div className="grid gap-6 sm:grid-cols-3">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5">
              <Icon className="mb-3 h-6 w-6 text-secondary" />
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function CategoryStrip({ categories }: { categories: string[] }) {
  if (categories.length === 0) return null;

  return (
    <section className={`${pagePadding} border-y border-border bg-muted/40 py-4`}>
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <span className="shrink-0 text-sm font-medium text-muted-foreground">Shop by category</span>
        {categories.slice(0, 12).map((cat) => (
          <Link
            key={cat}
            href={`${PUBLIC_CATALOG}?category=${encodeURIComponent(cat)}`}
            className="shrink-0 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {cat}
          </Link>
        ))}
        <Link href={PUBLIC_CATALOG} className="shrink-0 text-xs font-semibold text-secondary hover:underline">
          View all →
        </Link>
      </div>
    </section>
  );
}
