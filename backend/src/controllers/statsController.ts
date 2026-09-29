import type { Request, Response } from 'express';
import * as Stats from '../models/Stats';

// GET /api/stats/me
export async function getMyStats(req: Request, res: Response): Promise<void> {
  try {
    const stats = await Stats.getUserStats(req.user!.id);
    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Impossible de charger tes statistiques' });
  }
}
