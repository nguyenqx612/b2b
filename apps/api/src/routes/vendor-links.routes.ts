import { Router } from 'express';
import {
  vendorLinkRequestSchema,
  vendorLinkInviteSchema,
  updateVendorProfileSchema,
  updateVendorLinkSchema,
  ROLES,
} from '@b2b/shared';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import * as vendorService from '../services/vendor.service.js';

export const vendorLinksRouter = Router();

vendorLinksRouter.use(authenticate);

vendorLinksRouter.get('/my-vendors', authorize(ROLES.BUYER, ROLES.ADMIN), async (req, res, next) => {
  try {
    if (req.user!.role === ROLES.ADMIN) {
      res.json({ items: [], pending: [] });
      return;
    }
    res.json(await vendorService.listBuyerVendors(req.user!.sub));
  } catch (err) {
    next(err);
  }
});

vendorLinksRouter.get('/profile', authorize(ROLES.SELLER), async (req, res, next) => {
  try {
    res.json(await vendorService.getProfileForSeller(req.user!.sub));
  } catch (err) {
    next(err);
  }
});

vendorLinksRouter.patch('/profile', authorize(ROLES.SELLER), async (req, res, next) => {
  try {
    const input = updateVendorProfileSchema.parse(req.body);
    res.json(await vendorService.updateProfile(req.user!.sub, input));
  } catch (err) {
    next(err);
  }
});

vendorLinksRouter.get('/status/:slug', authorize(ROLES.BUYER), async (req, res, next) => {
  try {
    const link = await vendorService.getLinkForBuyer(req.user!.sub, req.params.slug);
    res.json({ link });
  } catch (err) {
    next(err);
  }
});

vendorLinksRouter.post('/request', authorize(ROLES.BUYER), async (req, res, next) => {
  try {
    const input = vendorLinkRequestSchema.parse(req.body);
    const link = await vendorService.requestAccess(req.user!.sub, input);
    res.status(201).json(link);
  } catch (err) {
    next(err);
  }
});

vendorLinksRouter.post('/invite', authorize(ROLES.SELLER), async (req, res, next) => {
  try {
    const input = vendorLinkInviteSchema.parse(req.body);
    const link = await vendorService.inviteBuyer(req.user!.sub, input.email);
    res.status(201).json(link);
  } catch (err) {
    next(err);
  }
});

vendorLinksRouter.get('/seller', authorize(ROLES.SELLER), async (req, res, next) => {
  try {
    res.json({ items: await vendorService.listSellerBuyers(req.user!.sub) });
  } catch (err) {
    next(err);
  }
});

vendorLinksRouter.patch('/:id', authorize(ROLES.SELLER, ROLES.ADMIN), async (req, res, next) => {
  try {
    const { status, rejectionNote } = updateVendorLinkSchema.parse(req.body);
    const link = await vendorService.updateLinkStatus(
      req.params.id,
      status,
      req.user!.sub,
      req.user!.role,
      rejectionNote,
    );
    res.json(link);
  } catch (err) {
    next(err);
  }
});
