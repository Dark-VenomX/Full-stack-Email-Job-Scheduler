import { Request, Response, NextFunction } from 'express';
import { useMocks } from '../config/env';

export interface AuthRequest extends Request {
  user?: { id: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    if (useMocks) {
      req.user = { id: 'u_mock_001' };
      return next();
    }
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (token.startsWith('mock-jwt-')) {
    req.user = { id: token.replace('mock-jwt-', '') };
    return next();
  }

  // If we had a real signed JWT, we would verify it here.
  // Since we just hand out mock-jwt-<id> upon successful Google OAuth verification,
  // we just trust it for this implementation.
  req.user = { id: token };
  next();
}
