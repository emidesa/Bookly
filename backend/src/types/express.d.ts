import type { JwtPayload } from './user';

// Ajoute req.user (rempli par verifyToken) au type Request d'Express
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
