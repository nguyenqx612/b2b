import { Router } from 'express';
import { registerSchema, loginSchema } from '@b2b/shared';
import * as authService from '../services/auth.service.js';
import { authenticate } from '../middleware/authenticate.js';
import { logAudit } from '../services/audit.service.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    await logAudit({
      actorId: result.user.id,
      action: 'user.registered',
      entityType: 'user',
      entityId: result.user.id,
      metadata: { role: result.user.role },
      req,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user!.sub);
    res.json(user);
  } catch (err) {
    next(err);
  }
});
