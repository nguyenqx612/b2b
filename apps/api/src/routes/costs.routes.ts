import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '@b2b/shared';
import { prisma } from '@b2b/db';
import { assertParticipantOrAdmin, assertSellerOfPo } from '../lib/po-access.js';
import { logAudit } from '../services/audit.service.js';

const costSchema = z.object({
  goodsFobCents: z.number().int().nonnegative(),
  freightCents: z.number().int().nonnegative().default(0),
  insuranceCents: z.number().int().nonnegative().default(0),
  customsDutyCents: z.number().int().nonnegative().default(0),
  portHandlingCents: z.number().int().nonnegative().default(0),
  otherCents: z.number().int().nonnegative().default(0),
  currency: z.string().length(3).default('USD'),
  notes: z.string().max(2000).optional(),
});

export const costsRouter = Router();

costsRouter.get('/:poId', authenticate, async (req, res, next) => {
  try {
    await assertParticipantOrAdmin(req.params.poId, req.user!.sub, req.user!.role);

    const breakdown = await prisma.costBreakdown.findFirst({
      where: { poId: req.params.poId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(breakdown);
  } catch (err) {
    next(err);
  }
});

costsRouter.post('/:poId', authenticate, authorize(ROLES.SELLER), async (req, res, next) => {
  try {
    await assertSellerOfPo(req.params.poId, req.user!.sub);

    const input = costSchema.parse(req.body);
    const totalLandedCents =
      input.goodsFobCents +
      input.freightCents +
      input.insuranceCents +
      input.customsDutyCents +
      input.portHandlingCents +
      input.otherCents;

    const breakdown = await prisma.costBreakdown.create({
      data: {
        poId: req.params.poId,
        createdBy: req.user!.sub,
        ...input,
        totalLandedCents,
      },
    });
    await logAudit({
      actorId: req.user!.sub,
      action: 'cost.created',
      entityType: 'cost_breakdown',
      entityId: breakdown.id,
      metadata: { poId: req.params.poId, totalLandedCents },
      req,
    });
    res.status(201).json(breakdown);
  } catch (err) {
    next(err);
  }
});
