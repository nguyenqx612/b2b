import { Router } from 'express';
import multer from 'multer';
import { createProductSchema, updateProductSchema, ROLES } from '@b2b/shared';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import * as productService from '../services/product.service.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export const productsRouter = Router();

// Buyer: browse all active products (price range only)
productsRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const { category, search, page, pageSize } = req.query as Record<string, string>;
    if (req.user!.role === ROLES.SELLER) {
      const result = await productService.listForSeller(req.user!.sub, {
        category, search, page: Number(page), pageSize: Number(pageSize),
      });
      res.json(result);
    } else {
      const result = await productService.listForBuyer({
        category, search, page: Number(page), pageSize: Number(pageSize),
      });
      res.json(result);
    }
  } catch (err) {
    next(err);
  }
});

productsRouter.get('/:id', authenticate, async (req, res, next) => {
  try {
    if (req.user!.role === ROLES.SELLER) {
      res.json(await productService.getForSeller(req.params.id, req.user!.sub));
    } else {
      res.json(await productService.getForBuyer(req.params.id));
    }
  } catch (err) {
    next(err);
  }
});

productsRouter.post('/', authenticate, authorize(ROLES.SELLER), async (req, res, next) => {
  try {
    const input = createProductSchema.parse(req.body);
    const product = await productService.create(req.user!.sub, input);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

productsRouter.patch('/:id', authenticate, authorize(ROLES.SELLER), async (req, res, next) => {
  try {
    const input = updateProductSchema.parse(req.body);
    await productService.update(req.params.id, req.user!.sub, input);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

productsRouter.post(
  '/:id/images',
  authenticate,
  authorize(ROLES.SELLER),
  upload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
      const result = await productService.addImage(req.params.id, req.user!.sub, req.file);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

productsRouter.delete('/:id', authenticate, authorize(ROLES.SELLER), async (req, res, next) => {
  try {
    await productService.remove(req.params.id, req.user!.sub);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
