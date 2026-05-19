import { prisma } from '@b2b/db';
import * as repo from '../repositories/order.repository.js';
import { canTransition, isValidTransition } from '@b2b/shared';
import type { CreatePOInput, UpdatePOItemsInput, UpdatePOStatusInput, OrderStatus, TransitionRole } from '@b2b/shared';

export async function listOrders(userId: string, role: 'buyer' | 'seller' | 'admin') {
  return repo.findAllForUser(userId, role);
}

export async function getOrder(poId: string, userId: string, role: string) {
  if (role === 'admin') {
    const po = await repo.findById(poId);
    if (!po) throw Object.assign(new Error('Order not found'), { status: 404 });
    return po;
  }
  return repo.assertParticipant(poId, userId).then(() => repo.findById(poId));
}

export async function createOrder(input: CreatePOInput, buyerId: string) {
  // Resolve products and lock in their current prices + CBM
  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map((i) => i.productId) }, isActive: true },
    select: { id: true, sellerId: true, priceUsdCents: true, cbmPerUnit: true },
  });

  if (products.length !== input.items.length) {
    throw Object.assign(new Error('One or more products not found or inactive'), { status: 422 });
  }

  // Ensure all products belong to the same seller
  const sellerIds = [...new Set(products.map((p) => p.sellerId))];
  if (sellerIds.length > 1) {
    throw Object.assign(new Error('All items in a PO must belong to the same seller'), { status: 422 });
  }
  if (sellerIds[0] !== input.sellerId) {
    throw Object.assign(new Error('Products do not belong to the specified seller'), { status: 422 });
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const items = input.items.map((item) => {
    const product = productMap.get(item.productId)!;
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPriceCents: product.priceUsdCents,
      cbmSubtotal: Number((item.quantity * Number(product.cbmPerUnit)).toFixed(4)),
    };
  });

  return repo.createWithVersion(
    { buyerId, sellerId: input.sellerId, notes: input.notes, shippingTerms: input.shippingTerms,
      portOfLoading: input.portOfLoading, portOfDischarge: input.portOfDischarge, items },
    buyerId,
  );
}

export async function updateItems(poId: string, input: UpdatePOItemsInput, userId: string) {
  const po = await repo.assertParticipant(poId, userId);
  if (!['draft', 'submitted', 'acknowledged'].includes(po.status)) {
    throw Object.assign(new Error('Items cannot be edited in the current status'), { status: 422 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map((i) => i.productId) }, sellerId: po.sellerId, isActive: true },
    select: { id: true, priceUsdCents: true, cbmPerUnit: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));
  const items = input.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) throw Object.assign(new Error(`Product ${item.productId} not found`), { status: 422 });
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPriceCents: product.priceUsdCents,
      cbmSubtotal: Number((item.quantity * Number(product.cbmPerUnit)).toFixed(4)),
    };
  });

  return repo.updateItemsWithVersion(poId, items, userId, input.changeReason);
}

export async function updateStatus(poId: string, input: UpdatePOStatusInput, userId: string, role: string) {
  const po = role === 'admin' ? await repo.findById(poId) : await repo.assertParticipant(poId, userId);
  if (!po) throw Object.assign(new Error('Order not found'), { status: 404 });

  if (!isValidTransition(po.status as OrderStatus, input.status as OrderStatus)) {
    throw Object.assign(
      new Error(`Cannot transition from ${po.status} to ${input.status}`),
      { status: 422 },
    );
  }

  if (!canTransition(role as TransitionRole, po.status as OrderStatus, input.status as OrderStatus)) {
    throw Object.assign(
      new Error(`Role ${role} cannot transition from ${po.status} to ${input.status}`),
      { status: 403 },
    );
  }

  return repo.updateStatus(poId, input.status as OrderStatus, userId, input.changeReason);
}

export async function getVersions(poId: string, userId: string, role: string) {
  if (role !== 'admin') await repo.assertParticipant(poId, userId);
  return repo.findVersions(poId);
}
