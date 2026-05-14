import { Router } from 'express';
import { createPOSchema, updatePOItemsSchema, updatePOStatusSchema, ROLES } from '@b2b/shared';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import * as orderService from '../services/order.service.js';

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
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

ordersRouter.patch('/:id/items', authenticate, async (req, res, next) => {
  try {
    const input = updatePOItemsSchema.parse(req.body);
    const order = await orderService.updateItems(req.params.id, input, req.user!.sub);
    res.json(order);
  } catch (err) {
    next(err);
  }
});

ordersRouter.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const input = updatePOStatusSchema.parse(req.body);
    const order = await orderService.updateStatus(req.params.id, input, req.user!.sub, req.user!.role);
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
