import type { LinkSource, LinkStatus } from '../constants/vendor-link.constants.js';

export interface VendorTeaserView {
  slug: string;
  displayName: string;
  tagline: string | null;
  about: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  teaserCategories: string[];
}

export interface VendorProfileView extends VendorTeaserView {
  sellerId: string;
  catalogSourceUrl: string | null;
  catalogLastImportedAt: string | null;
  isPublished: boolean;
}

export interface VendorListItem {
  slug: string;
  displayName: string;
  tagline: string | null;
  logoUrl: string | null;
  teaserCategories: string[];
}

export interface BuyerVendorSummary {
  sellerId: string;
  slug: string;
  displayName: string;
  tagline: string | null;
  logoUrl: string | null;
  linkStatus: LinkStatus;
  productCount?: number;
}

export interface BuyerVendorRequestSummary extends BuyerVendorSummary {
  linkId: string;
  createdAt: string;
}

export interface ShipperProfileView {
  userId: string;
  slug: string;
  displayName: string;
  tagline: string | null;
  about: string | null;
  logoUrl: string | null;
  serviceRegions: string[];
  isPublished: boolean;
}

export interface FreightQuoteView {
  id: string;
  poId: string;
  shipperId: string;
  status: string;
  freightCents: number;
  transitDays: number | null;
  notes: string | null;
  validUntil: string | null;
  createdAt: string;
  shipper?: { companyName: string | null; email: string; shipperProfile?: { displayName: string; slug: string } | null };
}

export interface VendorMessageView {
  id: string;
  senderId: string;
  body: string | null;
  fileName: string | null;
  createdAt: string;
  sender: { email: string; companyName: string | null; role: string };
}
