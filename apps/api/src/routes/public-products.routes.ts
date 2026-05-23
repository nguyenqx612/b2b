import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as productService from '../services/product.service.js';

export const publicProductsRouter = Router();

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

publicProductsRouter.use(publicLimiter);

publicProductsRouter.get('/', async (req, res, next) => {
  try {
    const { category, search, sellerId, page, pageSize } = req.query as Record<string, string>;
    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedPageSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const result = await productService.listForBuyer({
      category,
      search,
      sellerId,
      page: parsedPage,
      pageSize: parsedPageSize,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

publicProductsRouter.get('/categories', async (_req, res, next) => {
  try {
    res.json({ categories: await productService.listCategories() });
  } catch (err) {
    next(err);
  }
});

publicProductsRouter.get('/image-url', async (req, res, next) => {
  try {
    const key = req.query.key as string;
    if (!key) {
      res.status(400).json({ error: 'key query parameter is required' });
      return;
    }
    const url = await productService.getPublicImageUrl(key);
    res.json({ url });
  } catch (err) {
    next(err);
  }
});

publicProductsRouter.get('/:id', async (req, res, next) => {
  try {
    res.json(await productService.getForBuyer(req.params.id));
  } catch (err) {
    next(err);
  }
});
