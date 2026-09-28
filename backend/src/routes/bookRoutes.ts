import { Router } from 'express';
import { create, getAll, getOne, remove, updateStatus } from '../controllers/bookController';

const router = Router();

// Obligatoire : ajouter router.use(verifyToken) (Personne B), qui remplit req.user
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', updateStatus);
router.delete('/:id', remove);

export default router;
