import * as repo from '../repositories/vendor.repository.js';
import type { UpdateVendorProfileInput } from '@b2b/shared';
import { LINK_STATUS } from '@b2b/shared';

export async function listPublishedVendors() {
  return repo.listPublished();
}

export async function getTeaserBySlug(slug: string) {
  const profile = await repo.findBySlug(slug);
  if (!profile) throw Object.assign(new Error('Vendor not found'), { status: 404 });
  return {
    ...profile,
    teaserCategories: Array.isArray(profile.teaserCategories)
      ? (profile.teaserCategories as string[])
      : [],
  };
}

export async function getProfileForSeller(sellerId: string) {
  const profile = await repo.findBySellerId(sellerId);
  if (!profile) return null;
  return {
    ...profile,
    teaserCategories: Array.isArray(profile.teaserCategories)
      ? (profile.teaserCategories as string[])
      : [],
  };
}

export async function updateProfile(sellerId: string, input: UpdateVendorProfileInput) {
  const existing = await repo.findBySellerId(sellerId);
  if (existing && existing.slug !== input.slug) {
    const taken = await repo.findBySlug(input.slug);
    if (taken && taken.sellerId !== sellerId) {
      throw Object.assign(new Error('Slug already in use'), { status: 409 });
    }
  } else if (!existing) {
    const taken = await repo.findBySlug(input.slug);
    if (taken) throw Object.assign(new Error('Slug already in use'), { status: 409 });
  }

  return repo.upsertForSeller(sellerId, {
    slug: input.slug,
    displayName: input.displayName,
    tagline: input.tagline ?? null,
    about: input.about ?? null,
    websiteUrl: input.websiteUrl || null,
    logoUrl: input.logoUrl ?? null,
    catalogSourceUrl: input.catalogSourceUrl || null,
    teaserCategories: input.teaserCategories,
    isPublished: input.isPublished ?? true,
  });
}

export async function getApprovedSellerIds(buyerId: string) {
  return repo.findApprovedSellerIds(buyerId);
}

export async function assertBuyerCanAccessSeller(buyerId: string, sellerId: string) {
  const ok = await repo.hasApprovedLink(buyerId, sellerId);
  if (!ok) throw Object.assign(new Error('Access to this vendor catalog is not approved'), { status: 403 });
}

function mapVendorLink(l: Awaited<ReturnType<typeof repo.listForBuyer>>[number]) {
  if (!l.seller.vendorProfile) return null;
  return {
    linkId: l.id,
    sellerId: l.sellerId,
    slug: l.seller.vendorProfile.slug,
    displayName: l.seller.vendorProfile.displayName,
    tagline: l.seller.vendorProfile.tagline,
    logoUrl: l.seller.vendorProfile.logoUrl,
    linkStatus: l.status,
    createdAt: l.createdAt.toISOString(),
  };
}

export async function listBuyerVendors(buyerId: string) {
  const links = await repo.listForBuyer(buyerId);
  const approved = links
    .filter((l) => l.status === LINK_STATUS.APPROVED)
    .map(mapVendorLink)
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const pending = links
    .filter((l) => l.status === LINK_STATUS.PENDING)
    .map(mapVendorLink)
    .filter((x): x is NonNullable<typeof x> => x !== null);
  return { items: approved, pending };
}

export async function resolveSellerId(input: { sellerId?: string; slug?: string }) {
  if (input.sellerId) return input.sellerId;
  if (input.slug) {
    const id = await repo.findSellerIdBySlug(input.slug);
    if (!id) throw Object.assign(new Error('Vendor not found'), { status: 404 });
    return id;
  }
  throw Object.assign(new Error('sellerId or slug is required'), { status: 400 });
}

export async function requestAccess(buyerId: string, input: { sellerId?: string; slug?: string }) {
  const sellerId = await resolveSellerId(input);
  const buyer = await repo.findLink(buyerId, sellerId);
  if (buyer?.status === LINK_STATUS.APPROVED) {
    return buyer;
  }
  if (buyer?.status === LINK_STATUS.PENDING) {
    return buyer;
  }
  return repo.createLink({ buyerId, sellerId, source: 'buyer_request', status: LINK_STATUS.PENDING });
}

export async function inviteBuyer(sellerId: string, email: string) {
  const buyer = await repo.findBuyerByEmail(email);
  if (!buyer) {
    throw Object.assign(new Error('No active buyer account found for that email'), { status: 404 });
  }
  return repo.createLink({
    buyerId: buyer.id,
    sellerId,
    source: 'vendor_invite',
    status: LINK_STATUS.APPROVED,
    invitedEmail: email,
  });
}

export async function adminCreateLink(buyerId: string, sellerId: string, status: typeof LINK_STATUS[keyof typeof LINK_STATUS]) {
  return repo.createLink({ buyerId, sellerId, source: 'admin', status });
}

export async function updateLinkStatus(
  linkId: string,
  status: typeof LINK_STATUS[keyof typeof LINK_STATUS],
  actorId: string,
  actorRole: string,
  rejectionNote?: string,
) {
  const link = await repo.findLinkById(linkId);
  if (!link) throw Object.assign(new Error('Link not found'), { status: 404 });
  if (actorRole !== 'admin' && link.sellerId !== actorId) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }
  return repo.updateLinkStatus(linkId, status, rejectionNote);
}

export async function listSellerBuyers(sellerId: string) {
  return repo.listForSeller(sellerId);
}

export async function listAllLinks(page: number, pageSize: number) {
  return repo.listAll({ page, pageSize });
}

export async function getLinkForBuyer(buyerId: string, slug: string) {
  const sellerId = await repo.findSellerIdBySlug(slug);
  if (!sellerId) return null;
  return repo.findLink(buyerId, sellerId);
}
