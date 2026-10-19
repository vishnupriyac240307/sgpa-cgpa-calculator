import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
  registerNo?: string;
}

interface JwtPayload {
  userId: string;
  username: string;
  registerNo: string;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  let token: string | undefined = req.cookies?.token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'csda_sgpa_cgpa_calculator_jwt_secret_2026';

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.userId = decoded.userId;
    req.username = decoded.username;
    req.registerNo = decoded.registerNo;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
    return;
  }
}
