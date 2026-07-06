import { Router } from 'express';
import { repo } from '../db/repo';

import { authMiddleware, type AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const history = await repo.findSentHistory(req.user!.id);
  res.json(history);
});

router.delete('/', authMiddleware, async (req: AuthRequest, res) => {
  await repo.clearSentHistory(req.user!.id);
  res.json({ success: true });
});

export default router;
