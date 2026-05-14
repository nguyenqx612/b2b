import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/authenticate.js';
import { prisma } from '@b2b/db';
import { s3Service } from '../services/s3.service.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

export const messagesRouter = Router();

// Get message history for a PO
messagesRouter.get('/:poId', authenticate, async (req, res, next) => {
  try {
    const { poId } = req.params;

    // Verify participant
    const po = await prisma.purchaseOrder.findFirst({
      where: { id: poId, OR: [{ buyerId: req.user!.sub }, { sellerId: req.user!.sub }] },
      select: { id: true },
    });
    if (!po && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { poId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { email: true, companyName: true, role: true } } },
    });

    res.json(messages);
  } catch (err) {
    next(err);
  }
});

// Upload file attachment to a PO thread
messagesRouter.post(
  '/:poId/attachments',
  authenticate,
  upload.single('file'),
  async (req, res, next) => {
    try {
      const { poId } = req.params;
      if (!req.file) { res.status(400).json({ error: 'No file provided' }); return; }

      const po = await prisma.purchaseOrder.findFirst({
        where: { id: poId, OR: [{ buyerId: req.user!.sub }, { sellerId: req.user!.sub }] },
        select: { id: true },
      });
      if (!po) { res.status(403).json({ error: 'Access denied' }); return; }

      const key = await s3Service.uploadFile({
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        folder: `messages/${poId}`,
        filename: req.file.originalname,
      });

      const message = await prisma.message.create({
        data: {
          poId,
          senderId: req.user!.sub,
          messageType: 'file',
          fileS3Key: key,
          fileName: req.file.originalname,
          fileSizeBytes: req.file.size,
        },
        include: { sender: { select: { email: true, companyName: true, role: true } } },
      });

      const url = await s3Service.getSignedUrl(key);
      res.status(201).json({ message, url });
    } catch (err) {
      next(err);
    }
  },
);
