'use client';

import Link from 'next/link';
import { Package, FileText, MessageSquare, Zap, FileCheck, DollarSign } from 'lucide-react';
import { colors, spacing, typography } from '@/lib/design-tokens';

// Middleware redirects authenticated users away from '/' before this renders.
// This page is only ever seen by unauthenticated visitors.
export default function RootPage() {
  // Unauthenticated → show landing page
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: colors.background }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header style={{
        borderBottom: `1px solid ${colors.border}`,
        backgroundColor: colors.background,
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}>
        <div style={{
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${spacing.lg} ${spacing.lg}`,
          maxWidth: '1536px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Package size={20} color={colors.text.inverse} />
            </div>
            <span style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              letterSpacing: '-0.02em',
            }}>B2B Trade</span>
          </div>

          <nav style={{ display: 'flex', gap: spacing.lg, alignItems: 'center' }}>
            <a href="#features" style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, textDecoration: 'none' }}>Features</a>
            <a href="#how-it-works" style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, textDecoration: 'none' }}>How it works</a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <Link
              href="/auth/login"
              style={{
                borderRadius: '6px',
                padding: `${spacing.sm} ${spacing.md}`,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                textDecoration: 'none',
              }}
            >
              Log in
            </Link>
            <Link
              href="/auth/register"
              style={{
                borderRadius: '6px',
                backgroundColor: colors.primary,
                padding: `${spacing.sm} ${spacing.md}`,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.inverse,
                textDecoration: 'none',
              }}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: `${spacing.lg} ${spacing.lg}`,
        paddingTop: spacing.lg,
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: spacing.sm,
          borderRadius: '9999px',
          border: `1px solid ${colors.accent}`,
          backgroundColor: `${colors.accent}20`,
          padding: `${spacing.sm} ${spacing.md}`,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
          color: colors.primary,
          marginBottom: spacing.xl,
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.primary }} />
          Vietnam → USA trade, fully digital
        </div>

        <h1 style={{
          fontSize: typography.fontSize['5xl'],
          fontWeight: typography.fontWeight.extrabold,
          color: colors.text.primary,
          lineHeight: typography.lineHeight.tight,
          maxWidth: '800px',
          marginBottom: spacing.lg,
          letterSpacing: '-0.02em',
        }}>
          Replace email chaos with{' '}
          <span style={{ color: colors.primary }}>one platform</span>
        </h1>

        <p style={{
          fontSize: typography.fontSize.lg,
          color: colors.text.secondary,
          maxWidth: '600px',
          marginBottom: spacing.xl,
          lineHeight: typography.lineHeight.relaxed,
        }}>
          Manage purchase orders, negotiate in real time, simulate 40ft container loads,
          and generate export documents — all in one place.
        </p>

        <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/auth/register"
            style={{
              borderRadius: '8px',
              backgroundColor: colors.primary,
              padding: `${spacing.md} ${spacing.xl}`,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.inverse,
              textDecoration: 'none',
            }}
          >
            Start for free →
          </Link>
          <Link
            href="/auth/login"
            style={{
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.background,
              padding: `${spacing.md} ${spacing.xl}`,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              textDecoration: 'none',
            }}
          >
            Sign in to your account
          </Link>
        </div>

        {/* Stats strip */}
        <div style={{ marginTop: spacing.xl, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.xl }}>
          {[
            { value: '40ft', label: 'Container simulation' },
            { value: 'Real-time', label: 'Order collaboration' },
            { value: 'C/O Form B', label: 'Export ready docs' },
            { value: 'FOB → DDP', label: 'Full cost breakdown' },
          ].map((stat) => (
            <div key={stat.value} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>{stat.value}</div>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" style={{ paddingTop: spacing['2xl'], paddingBottom: spacing['2xl'], paddingLeft: spacing.lg, paddingRight: spacing.lg, backgroundColor: colors.background }}>
        <div style={{ margin: '0 auto', maxWidth: '1536px' }}>
          <div style={{ textAlign: 'center', marginBottom: spacing['2xl'] }}>
            <h2 style={{ fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary, marginBottom: spacing.lg }}>Everything trade requires</h2>
            <p style={{ color: colors.text.secondary, maxWidth: '500px', margin: '0 auto' }}>
              Built for importers and exporters who are tired of version-controlled spreadsheets and missed email threads.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: spacing.lg }}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  borderRadius: '12px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.background,
                  padding: spacing.lg,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{
                  marginBottom: spacing.md,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  backgroundColor: f.iconBg,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ marginBottom: spacing.sm, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>{f.title}</h3>
                <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: typography.lineHeight.relaxed }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section id="how-it-works" style={{ paddingTop: spacing['2xl'], paddingBottom: spacing['2xl'], paddingLeft: spacing.lg, paddingRight: spacing.lg, backgroundColor: colors.surface }}>
        <div style={{ margin: '0 auto', maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: spacing['2xl'] }}>
            <h2 style={{ fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary, marginBottom: spacing.lg }}>From quote to shipment</h2>
            <p style={{ color: colors.text.secondary }}>Four steps, zero spreadsheets.</p>
          </div>

          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {STEPS.map((step, i) => (
              <li key={step.title} style={{ display: 'flex', gap: spacing.lg, marginBottom: spacing.lg }}>
                <div style={{
                  flexShrink: 0,
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: colors.primary,
                  color: colors.text.inverse,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: typography.fontWeight.bold,
                  fontSize: typography.fontSize.sm,
                }}>
                  {i + 1}
                </div>
                <div style={{ paddingTop: '6px' }}>
                  <h3 style={{ fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.sm }}>{step.title}</h3>
                  <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: typography.lineHeight.relaxed }}>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section style={{ paddingTop: spacing['3xl'], paddingBottom: spacing['3xl'], paddingLeft: spacing.lg, paddingRight: spacing.lg, backgroundColor: colors.primary }}>
        <div style={{ margin: '0 auto', maxWidth: '700px', textAlign: 'center' }}>
          <h2 style={{ fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold, color: colors.text.inverse, marginBottom: spacing.lg }}>Ready to trade smarter?</h2>
          <p style={{ color: `${colors.text.inverse}99`, marginBottom: spacing.xl }}>
            Join buyers and sellers already managing orders on the platform.
            No credit card required.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.md }}>
            <Link
              href="/auth/register?role=buyer"
              style={{
                borderRadius: '8px',
                backgroundColor: colors.background,
                padding: `${spacing.md} ${spacing.xl}`,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.primary,
                textDecoration: 'none',
              }}
            >
              I'm a buyer
            </Link>
            <Link
              href="/auth/register?role=seller"
              style={{
                borderRadius: '8px',
                border: `1px solid ${colors.accent}`,
                backgroundColor: 'transparent',
                padding: `${spacing.md} ${spacing.xl}`,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.inverse,
                textDecoration: 'none',
              }}
            >
              I'm a seller
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${colors.border}`, paddingTop: spacing.lg, paddingBottom: spacing.lg, paddingLeft: spacing.lg, paddingRight: spacing.lg, textAlign: 'center' }}>
        <p style={{ fontSize: typography.fontSize.sm, color: colors.text.muted }}>
          © {new Date().getFullYear()} B2B Trade Platform. Built for Vietnam–USA trade.
        </p>
      </footer>
    </div>
  );
}

/* ── Static content ─────────────────────────────────────────────── */

const FEATURES = [
  {
    title: 'Product Catalog',
    description: 'Sellers list products with CBM dimensions and HS codes. Buyers see a transparent price range — the exact unit cost stays private.',
    iconBg: `${colors.accent}20`,
    icon: <Package size={20} color={colors.primary} />,
  },
  {
    title: 'Purchase Orders & Version History',
    description: 'Every edit is saved as an immutable version snapshot. Revert, compare, and audit any change — no more "which spreadsheet is final?".',
    iconBg: `${colors.accent}20`,
    icon: <FileText size={20} color={colors.primary} />,
  },
  {
    title: 'Real-time Messaging',
    description: 'Every purchase order has a live chat thread. Buyer and seller see messages the instant they\'re sent — powered by WebSocket.',
    iconBg: `${colors.accent}20`,
    icon: <MessageSquare size={20} color={colors.primary} />,
  },
  {
    title: '40ft Container Simulation',
    description: 'Paste your line items and instantly see total CBM, how many containers you need, and utilization percentage — before you commit.',
    iconBg: `${colors.accent}20`,
    icon: <Zap size={20} color={colors.primary} />,
  },
  {
    title: 'Export Documentation',
    description: 'Generate Vietnam C/O Form B, phytosanitary certificates, commercial invoices, and packing lists as PDFs — pre-filled from your order data.',
    iconBg: `${colors.accent}20`,
    icon: <FileCheck size={20} color={colors.primary} />,
  },
  {
    title: 'Landed Cost Breakdown',
    description: 'Sellers enter FOB price, freight, duties, and port handling. Buyers see a full landed-cost summary — no surprises at the port.',
    iconBg: `${colors.accent}20`,
    icon: <DollarSign size={20} color={colors.primary} />,
  },
];

const STEPS = [
  {
    title: 'Seller lists products',
    description: 'Upload products with CBM dimensions, HS codes, price range, and images. Buyers see your catalog instantly.',
  },
  {
    title: 'Buyer builds a purchase order',
    description: 'Select products, set quantities, and submit the order. The seller is notified in real time.',
  },
  {
    title: 'Collaborate and confirm',
    description: 'Both parties negotiate line items and pricing through the built-in message thread. Every edit is versioned.',
  },
  {
    title: 'Generate documents & ship',
    description: 'Export C/O Form B, phytosanitary cert, commercial invoice, and packing list as PDFs. Container simulation confirms your load before you book.',
  },
];
