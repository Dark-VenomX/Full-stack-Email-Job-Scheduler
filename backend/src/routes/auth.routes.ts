import { Router } from 'express';
import { verifyGoogleToken, getMockUser } from '../services/auth';
import { useMocks } from '../config/env';

const router = Router();

router.post('/google', async (req, res) => {
  const token = req.body?.credential as string | undefined;
  if (!token && !useMocks) {
    return res.status(400).json({ error: 'Missing credential' });
  }
  const user = await verifyGoogleToken(token || 'mock');
  res.json({ user, token: `mock-jwt-${user.id}` });
});

router.get('/me', (_req, res) => {
  res.json({ user: getMockUser() });
});

export default router;
