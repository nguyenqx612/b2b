import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { authRouter } from './routes/auth.routes.js';
import { publicProductsRouter } from './routes/public-products.routes.js';
import { productsRouter } from './routes/products.routes.js';
import { vendorsRouter } from './routes/vendors.routes.js';
import { vendorLinksRouter } from './routes/vendor-links.routes.js';
import { ordersRouter } from './routes/orders.routes.js';
import { messagesRouter } from './routes/messages.routes.js';
import { containerRouter } from './routes/container.routes.js';
import { documentsRouter } from './routes/documents.routes.js';
import { costsRouter } from './routes/costs.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { invoicesRouter } from './routes/invoices.routes.js';
import { vendorConversationsRouter } from './routes/vendor-conversations.routes.js';
import { freightRouter } from './routes/freight.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.NEXTAUTH_URL ?? 'http://localhost:3000',
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api', limiter);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRouter);
  app.use('/api/public/products', publicProductsRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/vendors', vendorsRouter);
  app.use('/api/vendor-links', vendorLinksRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/messages', messagesRouter);
  app.use('/api/container', containerRouter);
  app.use('/api/documents', documentsRouter);
  app.use('/api/costs', costsRouter);
  app.use('/api/invoices', invoicesRouter);
  app.use('/api/vendor-conversations', vendorConversationsRouter);
  app.use('/api/freight', freightRouter);
  app.use('/api/admin', adminRouter);

  app.use(errorHandler);

  return app;
}
