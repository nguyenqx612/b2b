import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '@b2b/shared';
import { prisma } from '@b2b/db';
import { logAudit } from '../services/audit.service.js';

export const adminRouter = Router();
adminRouter.use(authenticate, authorize(ROLES.ADMIN));

// List all users
adminRouter.get('/users', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, companyName: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Deactivate / reactivate user
adminRouter.patch('/users/:id', async (req, res, next) => {
  try {
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive },
      select: { id: true, email: true, role: true, isActive: true },
    });
    await logAudit({
      actorId: req.user!.sub,
      action: user.isActive ? 'user.reactivated' : 'user.deactivated',
      entityType: 'user',
      entityId: user.id,
      metadata: { targetRole: user.role },
      req,
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// List all orders (with optional status + search filters)
adminRouter.get('/orders', async (req, res, next) => {
  try {
    const { status, search } = req.query as Record<string, string>;
    const orders = await prisma.purchaseOrder.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(search ? {
          OR: [
            { poNumber: { contains: search, mode: 'insensitive' } },
            { buyer: { email: { contains: search, mode: 'insensitive' } } },
            { buyer: { companyName: { contains: search, mode: 'insensitive' } } },
            { seller: { email: { contains: search, mode: 'insensitive' } } },
            { seller: { companyName: { contains: search, mode: 'insensitive' } } },
          ],
        } : {}),
      },
      include: {
        buyer: { select: { email: true, companyName: true } },
        seller: { select: { email: true, companyName: true } },
        _count: { select: { items: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// Audit log
adminRouter.get('/audit', async (req, res, next) => {
  try {
    const { entityType, entityId, limit } = req.query as Record<string, string>;
    const logs = await prisma.auditLog.findMany({
      where: {
        ...(entityType ? { entityType } : {}),
        ...(entityId ? { entityId } : {}),
      },
      include: { actor: { select: { email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit ?? 100), 500),
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
});
