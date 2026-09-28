import { Router } from 'express';
import { findByIsbn, search } from '../controllers/googleController';

const router = Router();

// À protéger avec verifyToken (Personne B) une fois disponible
router.get('/search', search);
router.get('/isbn/:isbn', findByIsbn);

export default router;
