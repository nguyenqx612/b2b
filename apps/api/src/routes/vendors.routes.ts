import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as vendorService from '../services/vendor.service.js';

export const vendorsRouter = Router();

const teaserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

vendorsRouter.get('/', teaserLimiter, async (_req, res, next) => {
  try {
    res.json({ items: await vendorService.listPublishedVendors() });
  } catch (err) {
    next(err);
  }
});

vendorsRouter.get('/:slug/teaser', teaserLimiter, async (req, res, next) => {
  try {
    res.json(await vendorService.getTeaserBySlug(req.params.slug));
  } catch (err) {
    next(err);
  }
});
