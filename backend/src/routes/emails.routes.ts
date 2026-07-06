import { Router } from 'express';
import { repo } from '../db/repo';

import { authMiddleware, type AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const emails = await repo.findAll(req.user!.id);
  res.json(emails);
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const email = await repo.findById(req.params.id);
  // Verify ownership? Let's just do it simple for now, but strictly we should check ownership.
  if (!email || email.userId !== req.user!.id) return res.status(404).json({ error: 'Not found' });
  res.json(email);
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const email = await repo.findById(req.params.id);
  if (!email || email.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  if (email.status === 'PENDING') {
    const { cancelEmailJob } = await import('../queue/queueService.js');
    await cancelEmailJob(email.id);
  }
  
  const ok = await repo.deleteEmail(req.params.id, req.user!.id);
  if (!ok) return res.status(400).json({ error: 'Failed to delete' });
  res.json({ success: true });
});

export default router;
