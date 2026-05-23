import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES, ORDER_STATUS } from '@b2b/shared';
import { prisma } from '@b2b/db';
import { logAudit } from '../services/audit.service.js';

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const orderFilterSchema = z.object({
  status: z.nativeEnum(ORDER_STATUS).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const adminRouter = Router();
adminRouter.use(authenticate, authorize(ROLES.ADMIN));

adminRouter.get('/users', async (req, res, next) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, email: true, role: true, companyName: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);
    res.json({ items: users, total, page, limit });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/users/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user!.sub && req.body.isActive === false) {
      res.status(422).json({ error: 'Cannot deactivate your own account' });
      return;
    }
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

adminRouter.get('/orders', async (req, res, next) => {
  try {
    const { status, search, page, limit } = orderFilterSchema.parse(req.query);
    const skip = (page - 1) * limit;
    const where = {
      ...(status ? { status } : {}),
      ...(search ? {
        OR: [
          { poNumber: { contains: search, mode: 'insensitive' as const } },
          { buyer: { email: { contains: search, mode: 'insensitive' as const } } },
          { buyer: { companyName: { contains: search, mode: 'insensitive' as const } } },
          { seller: { email: { contains: search, mode: 'insensitive' as const } } },
          { seller: { companyName: { contains: search, mode: 'insensitive' as const } } },
        ],
      } : {}),
    };
    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          buyer: { select: { email: true, companyName: true } },
          seller: { select: { email: true, companyName: true } },
          _count: { select: { items: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);
    res.json({ items: orders, total, page, limit });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/audit', async (req, res, next) => {
  try {
    const schema = paginationSchema.extend({
      entityType: z.string().max(50).optional(),
      entityId: z.string().uuid().optional(),
    });
    const { entityType, entityId, page, limit } = schema.parse(req.query);
    const skip = (page - 1) * limit;
    const where = {
      ...(entityType ? { entityType } : {}),
      ...(entityId ? { entityId } : {}),
    };
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { actor: { select: { email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);
    res.json({ items: logs, total, page, limit });
  } catch (err) {
    next(err);
  }
});
