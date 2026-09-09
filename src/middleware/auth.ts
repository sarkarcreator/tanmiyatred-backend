import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request { user?: AuthUser }
  }
}

export function issueToken(user: AuthUser) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign(user, secret, { expiresIn: '8h' });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.tanmiyat_session || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined);
  if (!token) return res.status(401).json({ success: false, error: 'Authentication required.' });
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not configured');
    req.user = jwt.verify(token, secret) as AuthUser;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Session expired or invalid.' });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.tanmiyat_session || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined);
  if (!token) return next();
  try {
    const secret = process.env.JWT_SECRET;
    if (secret) req.user = jwt.verify(token, secret) as AuthUser;
  } catch {
    // Treat invalid optional credentials as anonymous.
  }
  next();
}

export function requireRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'You do not have permission for this action.' });
    }
    next();
  };
}
