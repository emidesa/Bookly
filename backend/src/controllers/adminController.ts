import type { Request, Response } from 'express';
import * as Stats from '../models/Stats';
import * as User from '../models/User';

// GET /api/admin/users
export async function getUsers(_req: Request, res: Response): Promise<void> {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Impossible de charger les utilisateurs' });
  }
}

// DELETE /api/admin/users/:id (livres et sessions supprimés en cascade)
export async function deleteUser(req: Request<{ id: string }>, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Utilisateur invalide' });
    return;
  }

  try {
    const deleted = await User.deleteById(id);
    if (!deleted) {
      res.status(404).json({ message: 'Utilisateur introuvable' });
      return;
    }
    res.status(200).json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Impossible de supprimer l'utilisateur" });
  }
}

// GET /api/admin/stats
export async function getStats(_req: Request, res: Response): Promise<void> {
  try {
    const stats = await Stats.getGlobalStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Impossible de charger les statistiques' });
  }
}
