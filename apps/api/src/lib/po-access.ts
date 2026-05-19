import { prisma } from '@b2b/db';
import { ROLES, type Role } from '@b2b/shared';
import * as orderRepo from '../repositories/order.repository.js';

type PoAccess = {
  id: string;
  buyerId: string;
  sellerId: string;
  status?: string;
  currentVersion?: number;
};

function forbidden(message = 'Access denied') {
  return Object.assign(new Error(message), { status: 403 });
}

function notFound(message = 'Purchase order not found') {
  return Object.assign(new Error(message), { status: 404 });
}

export async function assertParticipantOrAdmin(poId: string, userId: string, role: Role): Promise<PoAccess> {
  if (role === ROLES.ADMIN) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      select: { id: true, buyerId: true, sellerId: true, status: true, currentVersion: true },
    });
    if (!po) throw notFound();
    return po;
  }

  return orderRepo.assertParticipant(poId, userId);
}

export async function assertSellerOfPo(poId: string, sellerId: string): Promise<PoAccess> {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    select: { id: true, buyerId: true, sellerId: true, status: true, currentVersion: true },
  });

  if (!po) throw notFound();
  if (po.sellerId !== sellerId) throw forbidden();

  return po;
}

function parseScopedObjectKey(key: string) {
  if (key.startsWith('/') || key.includes('..') || key.includes('\\')) {
    throw forbidden('Invalid object key');
  }

  const [prefix, resourceId] = key.split('/');
  if (!prefix || !resourceId) throw forbidden('Invalid object key');

  return { prefix, resourceId };
}

export async function assertS3KeyAccess(key: string, userId: string, role: Role): Promise<void> {
  const { prefix, resourceId } = parseScopedObjectKey(key);

  if (prefix === 'messages' || prefix === 'documents') {
    await assertParticipantOrAdmin(resourceId, userId, role);
    return;
  }

  if (prefix === 'products') {
    return;
  }

  throw forbidden();
}
