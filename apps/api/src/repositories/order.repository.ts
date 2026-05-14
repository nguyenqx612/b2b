import { prisma } from '@b2b/db';
import type { Prisma, OrderStatus } from '@b2b/db';

const PO_INCLUDE = {
  items: {
    include: {
      product: { select: { name: true, sku: true, cbmPerUnit: true } },
    },
  },
} satisfies Prisma.PurchaseOrderInclude;

export async function findAllForUser(userId: string, role: 'buyer' | 'seller' | 'admin') {
  const where: Prisma.PurchaseOrderWhereInput =
    role === 'buyer' ? { buyerId: userId } : role === 'seller' ? { sellerId: userId } : {};
  return prisma.purchaseOrder.findMany({
    where,
    include: PO_INCLUDE,
    orderBy: { updatedAt: 'desc' },
  });
}

export async function findById(id: string) {
  return prisma.purchaseOrder.findUnique({ where: { id }, include: PO_INCLUDE });
}

export async function assertParticipant(poId: string, userId: string) {
  const po = await prisma.purchaseOrder.findFirst({
    where: { id: poId, OR: [{ buyerId: userId }, { sellerId: userId }] },
    select: { id: true, buyerId: true, sellerId: true, status: true, currentVersion: true },
  });
  if (!po) throw Object.assign(new Error('Purchase order not found'), { status: 404 });
  return po;
}

export async function createWithVersion(
  data: {
    buyerId: string;
    sellerId: string;
    notes?: string;
    shippingTerms?: string;
    portOfLoading?: string;
    portOfDischarge?: string;
    items: Array<{ productId: string; quantity: number; unitPriceCents: number; cbmSubtotal: number }>;
  },
  changedBy: string,
) {
  const poNumber = await generatePoNumber();

  return prisma.$transaction(async (tx) => {
    const po = await tx.purchaseOrder.create({
      data: {
        poNumber,
        buyerId: data.buyerId,
        sellerId: data.sellerId,
        notes: data.notes,
        shippingTerms: data.shippingTerms,
        portOfLoading: data.portOfLoading ?? 'Ho Chi Minh City',
        portOfDischarge: data.portOfDischarge ?? 'Los Angeles',
        currentVersion: 1,
        items: { createMany: { data: data.items } },
      },
      include: PO_INCLUDE,
    });

    await tx.pOVersion.create({
      data: {
        poId: po.id,
        versionNumber: 1,
        changedBy,
        changeReason: 'Initial PO creation',
        snapshot: po as unknown as Prisma.InputJsonValue,
      },
    });

    return po;
  });
}

export async function updateItemsWithVersion(
  poId: string,
  items: Array<{ productId: string; quantity: number; unitPriceCents: number; cbmSubtotal: number }>,
  changedBy: string,
  changeReason?: string,
) {
  return prisma.$transaction(async (tx) => {
    await tx.pOItem.deleteMany({ where: { poId } });
    await tx.pOItem.createMany({ data: items.map((i) => ({ ...i, poId })) });

    const po = await tx.purchaseOrder.update({
      where: { id: poId },
      data: { currentVersion: { increment: 1 } },
      include: PO_INCLUDE,
    });

    await tx.pOVersion.create({
      data: {
        poId,
        versionNumber: po.currentVersion,
        changedBy,
        changeReason: changeReason ?? 'Items updated',
        snapshot: po as unknown as Prisma.InputJsonValue,
      },
    });

    return po;
  });
}

export async function updateStatus(poId: string, status: OrderStatus, changedBy: string, reason?: string) {
  return prisma.$transaction(async (tx) => {
    const po = await tx.purchaseOrder.update({
      where: { id: poId },
      data: { status, currentVersion: { increment: 1 } },
      include: PO_INCLUDE,
    });

    await tx.pOVersion.create({
      data: {
        poId,
        versionNumber: po.currentVersion,
        changedBy,
        changeReason: reason ?? `Status changed to ${status}`,
        snapshot: po as unknown as Prisma.InputJsonValue,
      },
    });

    return po;
  });
}

export async function findVersions(poId: string) {
  return prisma.pOVersion.findMany({
    where: { poId },
    orderBy: { versionNumber: 'asc' },
    include: { changedByUser: { select: { email: true, companyName: true } } },
  });
}

async function generatePoNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.purchaseOrder.count({
    where: { poNumber: { startsWith: `PO-${year}-` } },
  });
  return `PO-${year}-${String(count + 1).padStart(4, '0')}`;
}
