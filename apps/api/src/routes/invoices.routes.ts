import { Router } from 'express';
import { prisma } from '@b2b/db';
import { authenticate } from '../middleware/authenticate.js';
import { assertParticipantOrAdmin } from '../lib/po-access.js';
import { s3Service } from '../services/s3.service.js';

export const invoicesRouter = Router();

invoicesRouter.get('/:poId', authenticate, async (req, res, next) => {
  try {
    await assertParticipantOrAdmin(req.params.poId, req.user!.sub, req.user!.role);

    const invoice = await prisma.proformaInvoice.findFirst({
      where: { poId: req.params.poId },
      orderBy: { issuedAt: 'desc' },
    });

    res.json({
      invoice,
      url: invoice?.pdfS3Key ? await s3Service.getSignedUrl(invoice.pdfS3Key) : null,
    });
  } catch (err) {
    next(err);
  }
});
