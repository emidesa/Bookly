import { Router } from 'express';
import { deleteUser, getStats, getUsers } from '../controllers/adminController';
import { verifyRole } from '../middlewares/verifyRole';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

// Toutes les routes : utilisateur connecté ET admin
router.use(verifyToken, verifyRole('admin'));

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/stats', getStats);

export default router;
