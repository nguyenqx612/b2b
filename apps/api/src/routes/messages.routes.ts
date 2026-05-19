import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/authenticate.js';
import { prisma } from '@b2b/db';
import { s3Service } from '../services/s3.service.js';
import { assertParticipantOrAdmin, assertS3KeyAccess } from '../lib/po-access.js';
import { assertMessageAttachmentUpload } from '../lib/upload-validation.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

export const messagesRouter = Router();

// Get signed URL for downloading a file
messagesRouter.get('/s3-signed-url', authenticate, async (req, res, next) => {
  try {
    const { key } = req.query;
    if (typeof key !== 'string' || !key) {
      res.status(400).json({ error: 'key parameter required' });
      return;
    }

    await assertS3KeyAccess(key, req.user!.sub, req.user!.role);

    const url = await s3Service.getSignedUrl(key);
    res.json({ url });
  } catch (err) {
    next(err);
  }
});

// Get message history for a PO
messagesRouter.get('/:poId', authenticate, async (req, res, next) => {
  try {
    const { poId } = req.params;

    await assertParticipantOrAdmin(poId, req.user!.sub, req.user!.role);

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
      assertMessageAttachmentUpload(req.file);

      await assertParticipantOrAdmin(poId, req.user!.sub, req.user!.role);

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
