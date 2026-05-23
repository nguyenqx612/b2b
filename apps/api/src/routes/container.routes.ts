import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { prisma } from '@b2b/db';
import type { Prisma } from '@b2b/db';
import { simulateContainer, containerSimulateSchema } from '@b2b/shared';
import { assertParticipantOrAdmin } from '../lib/po-access.js';

export const containerRouter = Router();

containerRouter.post('/:poId/simulate', authenticate, async (req, res, next) => {
  try {
    const poId = req.params['poId'] as string;
    const { containerType } = containerSimulateSchema.parse(req.body ?? {});
    const isAdmin = req.user!.role === 'admin';

    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: {
        items: { include: { product: { select: { name: true, cbmPerUnit: true } } } },
      },
    });

    if (!po) { res.status(404).json({ error: 'PO not found' }); return; }

    if (!isAdmin && po.buyerId !== req.user!.sub && po.sellerId !== req.user!.sub) {
      res.status(403).json({ error: 'Access denied' }); return;
    }

    const cbmItems = po.items.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      quantity: item.quantity,
      cbmPerUnit: Number(item.product.cbmPerUnit),
    }));

    const result = simulateContainer(cbmItems, containerType);

    const saved = await prisma.containerLoad.create({
      data: {
        poId,
        calculatedBy: req.user!.sub,
        totalCbm: result.totalCBM,
        containerType,
        containerCbm: result.containerCBM,
        containersNeeded: result.containersNeeded,
        utilizationPct: result.utilizationPct,
        itemsSnapshot: result.items as unknown as Prisma.InputJsonValue,
      },
    });

    res.json({ simulation: result, savedId: saved.id });
  } catch (err) {
    next(err);
  }
});

containerRouter.get('/:poId', authenticate, async (req, res, next) => {
  try {
    const poId = req.params['poId'] as string;
    await assertParticipantOrAdmin(poId, req.user!.sub, req.user!.role);

    const loads = await prisma.containerLoad.findMany({
      where: { poId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(loads);
  } catch (err) {
    next(err);
  }
});
