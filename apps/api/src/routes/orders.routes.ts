import { Router } from 'express';
import { createPOSchema, updatePOItemsSchema, updatePOStatusSchema, ROLES } from '@b2b/shared';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import * as orderService from '../services/order.service.js';
import { logAudit } from '../services/audit.service.js';

export const ordersRouter = Router();

ordersRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const orders = await orderService.listOrders(req.user!.sub, req.user!.role);
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

ordersRouter.get('/:id', authenticate, async (req, res, next) => {
  try {
    const order = await orderService.getOrder(req.params.id, req.user!.sub, req.user!.role);
    res.json(order);
  } catch (err) {
    next(err);
  }
});

ordersRouter.post('/', authenticate, authorize(ROLES.BUYER), async (req, res, next) => {
  try {
    const input = createPOSchema.parse(req.body);
    const order = await orderService.createOrder(input, req.user!.sub);
    await logAudit({
      actorId: req.user!.sub,
      action: 'po.created',
      entityType: 'purchase_order',
      entityId: order.id,
      metadata: { poNumber: order.poNumber },
      req,
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

ordersRouter.patch('/:id/items', authenticate, async (req, res, next) => {
  try {
    const input = updatePOItemsSchema.parse(req.body);
    const order = await orderService.updateItems(req.params.id, input, req.user!.sub);
    await logAudit({
      actorId: req.user!.sub,
      action: 'po.items_updated',
      entityType: 'purchase_order',
      entityId: order.id,
      metadata: { version: order.currentVersion },
      req,
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

ordersRouter.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const input = updatePOStatusSchema.parse(req.body);
    const order = await orderService.updateStatus(req.params.id, input, req.user!.sub, req.user!.role);
    await logAudit({
      actorId: req.user!.sub,
      action: 'po.status_changed',
      entityType: 'purchase_order',
      entityId: order.id,
      metadata: { status: order.status, version: order.currentVersion },
      req,
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

ordersRouter.get('/:id/versions', authenticate, async (req, res, next) => {
  try {
    const versions = await orderService.getVersions(req.params.id, req.user!.sub, req.user!.role);
    res.json(versions);
  } catch (err) {
    next(err);
  }
});
