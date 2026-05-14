import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '@b2b/shared';
import { prisma } from '@b2b/db';
import { s3Service } from '../services/s3.service.js';
import { generateDocument } from '../services/document.service.js';

const generateSchema = z.object({
  docType: z.enum([
    'commercial_invoice',
    'packing_list',
    'co_form_b',
    'phytosanitary',
    'bill_of_lading',
    'proforma_invoice',
    'us_import_declaration',
  ]),
});

export const documentsRouter = Router();

documentsRouter.get('/:poId', authenticate, async (req, res, next) => {
  try {
    const docs = await prisma.exportDocument.findMany({
      where: { poId: req.params.poId },
      orderBy: { createdAt: 'desc' },
    });

    // Attach signed URLs for each doc
    const withUrls = await Promise.all(
      docs.map(async (doc) => ({
        ...doc,
        url: doc.pdfS3Key ? await s3Service.getSignedUrl(doc.pdfS3Key) : null,
      })),
    );

    res.json(withUrls);
  } catch (err) {
    next(err);
  }
});

documentsRouter.post('/:poId/generate', authenticate, authorize(ROLES.SELLER), async (req, res, next) => {
  try {
    const { docType } = generateSchema.parse(req.body);
    const doc = await generateDocument(req.params.poId, docType, req.user!.sub);
    const url = doc.pdfS3Key ? await s3Service.getSignedUrl(doc.pdfS3Key) : null;
    res.status(201).json({ doc, url });
  } catch (err) {
    next(err);
  }
});
