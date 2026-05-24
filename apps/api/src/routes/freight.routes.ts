import { Router } from 'express';
import { freightQuoteSchema, updateShipperProfileSchema, ROLES } from '@b2b/shared';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import * as freightService from '../services/freight.service.js';

export const freightRouter = Router();

freightRouter.get('/shippers', authenticate, async (_req, res, next) => {
  try {
    res.json({ items: await freightService.listPublishedShippers() });
  } catch (err) {
    next(err);
  }
});

freightRouter.get('/shipper/profile', authenticate, authorize(ROLES.SHIPPER), async (req, res, next) => {
  try {
    res.json(await freightService.getShipperProfile(req.user!.sub));
  } catch (err) {
    next(err);
  }
});

freightRouter.patch('/shipper/profile', authenticate, authorize(ROLES.SHIPPER), async (req, res, next) => {
  try {
    const input = updateShipperProfileSchema.parse(req.body);
    res.json(await freightService.upsertShipperProfile(req.user!.sub, input));
  } catch (err) {
    next(err);
  }
});

freightRouter.get('/shipper/quotes', authenticate, authorize(ROLES.SHIPPER), async (req, res, next) => {
  try {
    res.json({ items: await freightService.listQuotesForShipper(req.user!.sub) });
  } catch (err) {
    next(err);
  }
});

freightRouter.get('/po/:poId', authenticate, async (req, res, next) => {
  try {
    res.json({ items: await freightService.listQuotesForPo(req.params.poId, req.user!.sub, req.user!.role) });
  } catch (err) {
    next(err);
  }
});

freightRouter.post('/po/:poId/request', authenticate, authorize(ROLES.BUYER, ROLES.SELLER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { shipperId } = req.body as { shipperId: string };
    if (!shipperId) {
      res.status(400).json({ error: 'shipperId is required' });
      return;
    }
    res.status(201).json(await freightService.requestQuote(req.params.poId, shipperId, req.user!.sub, req.user!.role));
  } catch (err) {
    next(err);
  }
});

freightRouter.post('/quotes/:quoteId/submit', authenticate, authorize(ROLES.SHIPPER), async (req, res, next) => {
  try {
    const input = freightQuoteSchema.parse(req.body);
    res.json(await freightService.submitQuote(req.params.quoteId, req.user!.sub, {
      ...input,
      validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
    }));
  } catch (err) {
    next(err);
  }
});

freightRouter.post('/po/:poId/quotes/:quoteId/accept', authenticate, authorize(ROLES.BUYER, ROLES.SELLER, ROLES.ADMIN), async (req, res, next) => {
  try {
    res.json(await freightService.acceptQuote(req.params.poId, req.params.quoteId, req.user!.sub, req.user!.role));
  } catch (err) {
    next(err);
  }
});
