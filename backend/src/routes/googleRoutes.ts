import { Router } from 'express';
import { findByIsbn, search } from '../controllers/googleController';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

// Réservé aux utilisateurs connectés : protège le quota de la clé Google
router.use(verifyToken);

router.get('/search', search);
router.get('/isbn/:isbn', findByIsbn);

export default router;
