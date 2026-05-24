import { z } from 'zod';
import { LINK_SOURCE, LINK_STATUS } from '../constants/vendor-link.constants.js';

export const updateVendorProfileSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  displayName: z.string().min(1).max(200),
  tagline: z.string().max(300).optional(),
  about: z.string().max(5000).optional(),
  websiteUrl: z.string().url().max(500).optional().or(z.literal('')),
  logoUrl: z.string().max(500).optional(),
  catalogSourceUrl: z.string().url().max(500).optional().or(z.literal('')),
  teaserCategories: z.array(z.string().min(1).max(100)).max(30),
  isPublished: z.boolean().optional(),
});

export const vendorLinkRequestSchema = z.object({
  sellerId: z.string().uuid().optional(),
  slug: z.string().min(2).max(100).optional(),
}).refine((d) => d.sellerId || d.slug, { message: 'sellerId or slug is required' });

export const vendorLinkInviteSchema = z.object({
  email: z.string().email(),
});

export const adminVendorLinkSchema = z.object({
  buyerId: z.string().uuid(),
  sellerId: z.string().uuid(),
  status: z.enum([LINK_STATUS.PENDING, LINK_STATUS.APPROVED, LINK_STATUS.BLOCKED]).default(LINK_STATUS.APPROVED),
});

export const updateVendorLinkSchema = z.object({
  status: z.enum([LINK_STATUS.APPROVED, LINK_STATUS.BLOCKED, LINK_STATUS.PENDING]),
  rejectionNote: z.string().max(500).optional(),
});

export const importCatalogSchema = z.object({
  url: z.string().url().max(500).optional(),
});

export const vendorMessageSchema = z.object({
  body: z.string().min(1).max(5000),
});

export const updateShipperProfileSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  displayName: z.string().min(1).max(200),
  tagline: z.string().max(300).optional(),
  about: z.string().max(5000).optional(),
  logoUrl: z.string().max(500).optional(),
  serviceRegions: z.array(z.string().min(1).max(100)).max(20).optional(),
  isPublished: z.boolean().optional(),
});

export const freightQuoteSchema = z.object({
  freightCents: z.number().int().positive(),
  transitDays: z.number().int().positive().optional(),
  notes: z.string().max(2000).optional(),
  validUntil: z.string().datetime().optional(),
});

export const bulkProductActiveSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1),
  isActive: z.boolean(),
});

export type UpdateVendorProfileInput = z.infer<typeof updateVendorProfileSchema>;
export type VendorLinkRequestInput = z.infer<typeof vendorLinkRequestSchema>;
export type VendorLinkInviteInput = z.infer<typeof vendorLinkInviteSchema>;
export type AdminVendorLinkInput = z.infer<typeof adminVendorLinkSchema>;
export type UpdateVendorLinkInput = z.infer<typeof updateVendorLinkSchema>;
