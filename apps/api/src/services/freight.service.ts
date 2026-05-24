import { prisma } from '@b2b/db';
import * as freightRepo from '../repositories/freight.repository.js';
import * as orderRepo from '../repositories/order.repository.js';

export async function listPublishedShippers() {
  return freightRepo.listPublished();
}

export async function getShipperProfile(userId: string) {
  return freightRepo.findByUserId(userId);
}

export async function upsertShipperProfile(userId: string, data: {
  slug: string;
  displayName: string;
  tagline?: string | null;
  about?: string | null;
  logoUrl?: string | null;
  serviceRegions?: string[];
  isPublished?: boolean;
}) {
  const existing = await freightRepo.findByUserId(userId);
  if (existing && existing.slug !== data.slug) {
    const taken = await prisma.shipperProfile.findUnique({ where: { slug: data.slug } });
    if (taken && taken.userId !== userId) {
      throw Object.assign(new Error('Slug already in use'), { status: 409 });
    }
  }
  return freightRepo.upsert(userId, data);
}

async function assertPoParticipant(poId: string, userId: string, role: string) {
  if (role === 'admin') return orderRepo.findById(poId);
  return orderRepo.assertParticipant(poId, userId).then(() => orderRepo.findById(poId));
}

export async function listQuotesForPo(poId: string, userId: string, role: string) {
  await assertPoParticipant(poId, userId, role);
  return freightRepo.listQuotesForPo(poId);
}

export async function requestQuote(poId: string, shipperId: string, userId: string, role: string) {
  await assertPoParticipant(poId, userId, role);
  const shipper = await freightRepo.findByUserId(shipperId);
  if (!shipper?.isPublished) {
    throw Object.assign(new Error('Shipper not found'), { status: 404 });
  }
  const existing = await prisma.freightQuote.findFirst({ where: { poId, shipperId } });
  if (existing) return existing;
  return prisma.freightQuote.create({
    data: { poId, shipperId, status: 'draft', freightCents: 0 },
  });
}

export async function submitQuote(quoteId: string, shipperId: string, data: {
  freightCents: number;
  transitDays?: number;
  notes?: string;
  validUntil?: Date;
}) {
  const quote = await prisma.freightQuote.findFirst({ where: { id: quoteId, shipperId } });
  if (!quote) throw Object.assign(new Error('Quote not found'), { status: 404 });
  return prisma.freightQuote.update({
    where: { id: quoteId },
    data: { ...data, status: 'submitted' },
  });
}

export async function acceptQuote(poId: string, quoteId: string, userId: string, role: string) {
  await assertPoParticipant(poId, userId, role);
  return freightRepo.acceptQuote(quoteId, poId);
}

export async function listQuotesForShipper(shipperId: string) {
  return freightRepo.listQuotesForShipper(shipperId);
}
