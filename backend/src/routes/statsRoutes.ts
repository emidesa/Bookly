import { Router } from 'express';
import { getMyStats } from '../controllers/statsController';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

router.get('/me', verifyToken, getMyStats);

export default router;
