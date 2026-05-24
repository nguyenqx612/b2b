import { ShieldCheck, Truck, FileCheck } from 'lucide-react';
import { brand, pagePadding } from '@/lib/design-tokens';
import { LandingCTA } from './LandingCTA';

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: 'Private vendor portals', desc: 'Wholesale catalogs visible only to approved buyers.' },
  { icon: Truck, title: 'Container-ready', desc: 'CBM and load data built into every SKU.' },
  { icon: FileCheck, title: 'Export documents', desc: 'C/O, invoices, and packing lists in one place.' },
];

export const HOW_IT_WORKS_STEPS = [
  'Connect with a vendor',
  'Browse private wholesale catalog',
  'Build a purchase order',
  'Collaborate, confirm & ship',
];

export function LandingContent() {
  return (
    <div className="w-full">
      <section className={`${pagePadding} border-b border-border bg-card py-12 lg:py-16`}>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-medium text-secondary">{brand.tagline}</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Private wholesale trade
              <span className="text-primary"> without the email chaos</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              HarborLane connects importers with verified manufacturers through invite-only vendor portals.
              No public pricing — just secure B2B collaboration, container planning, and export documents.
            </p>
            <LandingCTA />
          </div>

          <div id="how-it-works" className="rounded-2xl border border-border bg-muted/50 p-6 scroll-mt-24">
            <p className="mb-4 text-sm font-semibold text-foreground">How it works</p>
            <ol className="space-y-3">
              {HOW_IT_WORKS_STEPS.map((step, i) => (
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
