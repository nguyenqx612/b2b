import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { prisma } from '@b2b/db';
import { simulateContainer } from '@b2b/shared';
import type { ContainerType } from '@b2b/shared';

export const containerRouter = Router();

// Calculate and persist a container simulation for a PO
containerRouter.post('/:poId/simulate', authenticate, async (req, res, next) => {
  try {
    const poId = req.params['poId'] as string;
    const containerType = (req.body.containerType ?? '40ft') as ContainerType;
    const isAdmin = req.user!.role === 'admin';

    // Always include items in the query — check access separately
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: {
        items: { include: { product: { select: { name: true, cbmPerUnit: true } } } },
      },
    });

    if (!po) { res.status(404).json({ error: 'PO not found' }); return; }

    // Non-admin must be a participant
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
        itemsSnapshot: result.items as unknown as any,
      },
    });

    res.json({ simulation: result, savedId: saved.id });
  } catch (err) {
    next(err);
  }
});

// Get previous simulations for a PO
containerRouter.get('/:poId', authenticate, async (req, res, next) => {
  try {
    const poId = req.params['poId'] as string;
    const loads = await prisma.containerLoad.findMany({
      where: { poId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(loads);
  } catch (err) {
    next(err);
  }
});
