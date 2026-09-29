import { Router } from 'express';
import { login, me, register } from '../controllers/authController';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

// Publiques
router.post('/register', register);
router.post('/login', login);

// Connecté : verifyToken sur cette route uniquement
router.get('/me', verifyToken, me);

export default router;
