import { Router } from 'express';
import { create, getByBook, remove, update } from '../controllers/readingSessionController';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

// Monté sur /api : verifyToken route par route, pas de router.use
// (sinon toute requête /api/* passant ici exigerait un token)
router.get('/books/:bookId/sessions', verifyToken, getByBook);
router.post('/sessions', verifyToken, create);
router.put('/sessions/:id', verifyToken, update);
router.delete('/sessions/:id', verifyToken, remove);

export default router;
