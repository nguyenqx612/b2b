import { prisma } from '@b2b/db';
import type { LinkSource, LinkStatus } from '@b2b/shared';

export async function listPublished() {
  const rows = await prisma.vendorProfile.findMany({
    where: { isPublished: true },
    select: {
      slug: true,
      displayName: true,
      tagline: true,
      logoUrl: true,
      teaserCategories: true,
    },
    orderBy: { displayName: 'asc' },
  });
  return rows.map((r) => ({
    ...r,
    teaserCategories: Array.isArray(r.teaserCategories) ? (r.teaserCategories as string[]) : [],
  }));
}

export async function findBySlug(slug: string) {
  return prisma.vendorProfile.findFirst({
    where: { slug, isPublished: true },
    select: {
      sellerId: true,
      slug: true,
      displayName: true,
      tagline: true,
      about: true,
      websiteUrl: true,
      logoUrl: true,
      teaserCategories: true,
      isPublished: true,
    },
  });
}

export async function findBySellerId(sellerId: string) {
  return prisma.vendorProfile.findUnique({
    where: { sellerId },
  });
}

export async function upsertForSeller(
  sellerId: string,
  data: {
    slug: string;
    displayName: string;
    tagline?: string | null;
    about?: string | null;
    websiteUrl?: string | null;
    logoUrl?: string | null;
    catalogSourceUrl?: string | null;
    teaserCategories: string[];
    isPublished?: boolean;
    catalogLastImportedAt?: Date | null;
  },
) {
  return prisma.vendorProfile.upsert({
    where: { sellerId },
    create: { sellerId, ...data },
    update: data,
  });
}

export async function findSellerIdBySlug(slug: string) {
  const profile = await prisma.vendorProfile.findUnique({
    where: { slug },
    select: { sellerId: true },
  });
  return profile?.sellerId ?? null;
}

export async function findLink(buyerId: string, sellerId: string) {
  return prisma.buyerVendorLink.findUnique({
    where: { buyerId_sellerId: { buyerId, sellerId } },
  });
}

export async function findApprovedSellerIds(buyerId: string) {
  const links = await prisma.buyerVendorLink.findMany({
    where: { buyerId, status: 'approved' },
    select: { sellerId: true },
  });
  return links.map((l) => l.sellerId);
}

export async function hasApprovedLink(buyerId: string, sellerId: string) {
  const link = await findLink(buyerId, sellerId);
  return link?.status === 'approved';
}

export async function listForBuyer(buyerId: string) {
  return prisma.buyerVendorLink.findMany({
    where: { buyerId },
    include: {
      seller: {
        select: {
          id: true,
          companyName: true,
          vendorProfile: {
            select: {
              slug: true,
              displayName: true,
              tagline: true,
              logoUrl: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function listForSeller(sellerId: string, status?: LinkStatus) {
  return prisma.buyerVendorLink.findMany({
    where: { sellerId, ...(status ? { status } : {}) },
    include: {
      buyer: { select: { id: true, email: true, companyName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function listAll(options: { page: number; pageSize: number }) {
  const { page, pageSize } = options;
  const [items, total] = await Promise.all([
    prisma.buyerVendorLink.findMany({
      include: {
        buyer: { select: { email: true, companyName: true } },
        seller: {
          select: {
            email: true,
            companyName: true,
            vendorProfile: { select: { slug: true, displayName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.buyerVendorLink.count(),
  ]);
  return { items, total, page, pageSize };
}

export async function createLink(data: {
  buyerId: string;
  sellerId: string;
  source: LinkSource;
  status?: LinkStatus;
  invitedEmail?: string | null;
}) {
  const status = data.status ?? (data.source === 'admin' ? 'approved' : 'pending');
  return prisma.buyerVendorLink.upsert({
    where: { buyerId_sellerId: { buyerId: data.buyerId, sellerId: data.sellerId } },
    create: {
      buyerId: data.buyerId,
      sellerId: data.sellerId,
      source: data.source,
      status,
      invitedEmail: data.invitedEmail ?? null,
      approvedAt: status === 'approved' ? new Date() : null,
    },
    update: {
      ...(status === 'approved' ? { status, approvedAt: new Date() } : { status }),
      source: data.source,
    },
    include: {
      buyer: { select: { email: true, companyName: true } },
      seller: { select: { email: true, companyName: true } },
    },
  });
}

export async function updateLinkStatus(id: string, status: LinkStatus, rejectionNote?: string | null) {
  return prisma.buyerVendorLink.update({
    where: { id },
    data: {
      status,
      approvedAt: status === 'approved' ? new Date() : null,
      ...(rejectionNote !== undefined ? { rejectionNote } : {}),
    },
    include: {
      buyer: { select: { email: true, companyName: true } },
      seller: {
        select: {
          email: true,
          companyName: true,
          vendorProfile: { select: { slug: true, displayName: true } },
        },
      },
    },
  });
}

export async function findLinkById(id: string) {
  return prisma.buyerVendorLink.findUnique({
    where: { id },
    include: {
      buyer: { select: { id: true, email: true, companyName: true } },
      seller: { select: { id: true, email: true, companyName: true } },
    },
  });
}

export async function findBuyerByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email, role: 'buyer', isActive: true },
    select: { id: true, email: true, companyName: true },
  });
}
