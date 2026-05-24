import { Router } from 'express';

export const publicProductsRouter = Router();

// Public product catalog removed — wholesale catalogs are relationship-gated.
publicProductsRouter.all('*', (_req, res) => {
  res.status(404).json({ error: 'Public product catalog is not available' });
});
