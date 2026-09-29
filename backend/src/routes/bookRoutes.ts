import { Router } from 'express';
import { create, getAll, getOne, getTrending, remove, updateStatus } from '../controllers/bookController';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

// Toutes les routes exigent un token : verifyToken remplit req.user
router.use(verifyToken);

router.get('/', getAll);
router.get('/trending', getTrending); // avant /:id, sinon « trending » serait pris pour un id
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', updateStatus);
router.delete('/:id', remove);

export default router;
