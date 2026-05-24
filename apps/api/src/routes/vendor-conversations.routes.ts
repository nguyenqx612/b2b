import { Router } from 'express';
import { vendorMessageSchema, ROLES } from '@b2b/shared';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import * as convService from '../services/vendor-conversation.service.js';

export const vendorConversationsRouter = Router();

vendorConversationsRouter.use(authenticate);

vendorConversationsRouter.get('/inbox', authorize(ROLES.BUYER), async (req, res, next) => {
  try {
    res.json({ items: await convService.listForBuyer(req.user!.sub) });
  } catch (err) {
    next(err);
  }
});

vendorConversationsRouter.post('/with/:sellerId', authorize(ROLES.BUYER), async (req, res, next) => {
  try {
    const conv = await convService.startFromBuyer(req.user!.sub, req.params.sellerId);
    res.json(conv);
  } catch (err) {
    next(err);
  }
});

vendorConversationsRouter.post('/buyer/:buyerId', authorize(ROLES.SELLER), async (req, res, next) => {
  try {
    const conv = await convService.startFromSeller(req.user!.sub, req.params.buyerId);
    res.status(201).json(conv);
  } catch (err) {
    next(err);
  }
});

vendorConversationsRouter.get('/:id/messages', async (req, res, next) => {
  try {
    res.json(await convService.listMessages(req.params.id, req.user!.sub));
  } catch (err) {
    next(err);
  }
});

vendorConversationsRouter.post('/:id/messages', async (req, res, next) => {
  try {
    const { body } = vendorMessageSchema.parse(req.body);
    res.status(201).json(await convService.sendMessage(req.params.id, req.user!.sub, body));
  } catch (err) {
    next(err);
  }
});
