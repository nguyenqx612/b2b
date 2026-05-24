import { prisma } from '@b2b/db';

export async function listPublished() {
  return prisma.shipperProfile.findMany({
    where: { isPublished: true },
    select: {
      userId: true,
      slug: true,
      displayName: true,
      tagline: true,
      logoUrl: true,
      serviceRegions: true,
    },
    orderBy: { displayName: 'asc' },
  });
}

export async function findByUserId(userId: string) {
  return prisma.shipperProfile.findUnique({ where: { userId } });
}

export async function upsert(userId: string, data: {
  slug: string;
  displayName: string;
  tagline?: string | null;
  about?: string | null;
  logoUrl?: string | null;
  serviceRegions?: string[];
  isPublished?: boolean;
}) {
  return prisma.shipperProfile.upsert({
    where: { userId },
    create: { userId, serviceRegions: data.serviceRegions ?? [], ...data },
    update: data,
  });
}

export async function listQuotesForPo(poId: string) {
  return prisma.freightQuote.findMany({
    where: { poId },
    include: {
      shipper: {
        select: {
          email: true,
          companyName: true,
          shipperProfile: { select: { displayName: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function listQuotesForShipper(shipperId: string) {
  return prisma.freightQuote.findMany({
    where: { shipperId },
    include: {
      po: {
        select: {
          id: true,
          poNumber: true,
          status: true,
          portOfLoading: true,
          portOfDischarge: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createQuote(data: {
  poId: string;
  shipperId: string;
  freightCents: number;
  transitDays?: number;
  notes?: string;
  validUntil?: Date;
}) {
  return prisma.freightQuote.create({
    data: { ...data, status: 'submitted' },
    include: {
      shipper: {
        select: {
          email: true,
          companyName: true,
          shipperProfile: { select: { displayName: true, slug: true } },
        },
      },
    },
  });
}

export async function acceptQuote(quoteId: string, poId: string) {
  const quote = await prisma.freightQuote.findFirst({ where: { id: quoteId, poId } });
  if (!quote) throw Object.assign(new Error('Quote not found'), { status: 404 });

  await prisma.$transaction([
    prisma.freightQuote.updateMany({
      where: { poId, id: { not: quoteId } },
      data: { status: 'rejected' },
    }),
    prisma.freightQuote.update({
      where: { id: quoteId },
      data: { status: 'accepted' },
    }),
  ]);

  const existingCost = await prisma.costBreakdown.findFirst({
    where: { poId },
    orderBy: { createdAt: 'desc' },
  });

  if (existingCost) {
    await prisma.costBreakdown.update({
      where: { id: existingCost.id },
      data: {
        freightCents: quote.freightCents,
        totalLandedCents:
          existingCost.goodsFobCents +
          quote.freightCents +
          existingCost.insuranceCents +
          existingCost.customsDutyCents +
          existingCost.portHandlingCents +
          existingCost.otherCents,
      },
    });
  }

  return quote;
}
