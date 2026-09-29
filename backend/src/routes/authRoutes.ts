import { Router } from 'express';
import { login, me, register, updateMe } from '../controllers/authController';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

// Publiques
router.post('/register', register);
router.post('/login', login);

// Connecté : verifyToken sur ces routes uniquement
router.get('/me', verifyToken, me);
router.put('/me', verifyToken, updateMe);

export default router;
