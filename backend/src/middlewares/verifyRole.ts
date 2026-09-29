import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Role } from '../types/user';

// Renvoie un middleware qui n'autorise que le rôle demandé (à placer après verifyToken)
export function verifyRole(role: Role): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Sécurité si verifyToken a été oublié avant
    if (!req.user) {
      res.status(401).json({ message: 'Token manquant' });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({ message: 'Accès refusé' });
      return;
    }

    next();
  };
}
