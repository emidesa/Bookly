import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt';
import type { JwtPayload } from '../types/user';

// Vérifie que le contenu du token a la forme attendue
function isJwtPayload(value: unknown): value is JwtPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    'role' in value &&
    (value.role === 'reader' || value.role === 'admin')
  );
}

// Vérifie le token « Authorization: Bearer <token> » et remplit req.user
export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token manquant' });
    return;
  }

  const token = header.slice('Bearer '.length);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!isJwtPayload(decoded)) {
      res.status(401).json({ message: 'Token invalide' });
      return;
    }
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Session expirée' });
      return;
    }
    res.status(401).json({ message: 'Token invalide' });
  }
}
