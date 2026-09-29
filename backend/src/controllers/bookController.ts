import { Request, Response } from 'express';
import * as Book from '../models/Book';
import { BookStatus, CreateBookBody } from '../types/book';

const statusList: BookStatus[] = ['to_read', 'reading', 'read'];

// GET /api/books/trending
export async function getTrending(_req: Request, res: Response): Promise<void> {
  try {
    const books = await Book.findTrending();
    res.status(200).json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Impossible de charger les recommandations' });
  }
}

// GET /api/books
export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const books = await Book.findAllByUser(req.user!.id);
    res.status(200).json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Impossible de charger ta PAL' });
  }
}

// GET /api/books/:id
export async function getOne(req: Request<{ id: string }>, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Livre invalide' });
    return;
  }

  try {
    const book = await Book.findByIdAndUser(id, req.user!.id);
    if (!book) {
      res.status(404).json({ message: 'Livre introuvable' });
      return;
    }
    res.status(200).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Impossible de charger ce livre' });
  }
}

// POST /api/books
export async function create(req: Request<{}, {}, CreateBookBody>, res: Response): Promise<void> {
  const { google_id, title, author, total_pages, cover_url, description } = req.body ?? {};

  // Le body vient du client : on vérifie le vrai type de chaque champ
  if (typeof google_id !== 'string' || google_id.trim() === '' || typeof title !== 'string' || title.trim() === '') {
    res.status(400).json({ message: 'Informations du livre incomplètes' });
    return;
  }
  // Longueurs maximales des colonnes (sinon MySQL refuse et renvoie une erreur 500)
  if (google_id.length > 50 || title.length > 255) {
    res.status(400).json({ message: 'Informations du livre trop longues' });
    return;
  }
  if (author !== undefined && author !== null && (typeof author !== 'string' || author.length > 255)) {
    res.status(400).json({ message: 'Auteur invalide' });
    return;
  }
  // Nombre entier positif (pas -12 ni 3.7)
  if (total_pages !== undefined && total_pages !== null && (!Number.isInteger(total_pages) || total_pages < 0)) {
    res.status(400).json({ message: 'Nombre de pages invalide' });
    return;
  }
  if (cover_url !== undefined && cover_url !== null && (typeof cover_url !== 'string' || cover_url.length > 500)) {
    res.status(400).json({ message: 'Couverture invalide' });
    return;
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    res.status(400).json({ message: 'Résumé invalide' });
    return;
  }

  try {
    const bookData: CreateBookBody = {
      google_id,
      title,
      author: author ?? null,
      total_pages: total_pages ?? null,
      cover_url: cover_url ?? null,
      description: description ?? null,
    };
    const id = await Book.create(req.user!.id, bookData);
    const book = await Book.findByIdAndUser(id, req.user!.id);
    res.status(201).json(book);
  } catch (error) {
    // Contrainte UNIQUE (user_id, google_id)
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Ce livre est déjà dans ta PAL' });
      return;
    }
    console.error(error);
    res.status(500).json({ message: "Impossible d'ajouter ce livre" });
  }
}

// PUT /api/books/:id
export async function updateStatus(req: Request<{ id: string }, {}, { status: BookStatus }>, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { status } = req.body ?? {};
  if (!Number.isInteger(id) || typeof status !== 'string' || !statusList.includes(status)) {
    res.status(400).json({ message: 'Statut invalide' });
    return;
  }

  try {
    const updated = await Book.updateStatus(id, req.user!.id, status);
    if (!updated) {
      res.status(404).json({ message: 'Livre introuvable' });
      return;
    }
    const book = await Book.findByIdAndUser(id, req.user!.id);
    res.status(200).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Impossible de modifier ce livre' });
  }
}

// DELETE /api/books/:id
export async function remove(req: Request<{ id: string }>, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Livre invalide' });
    return;
  }

  try {
    const deleted = await Book.remove(id, req.user!.id);
    if (!deleted) {
      res.status(404).json({ message: 'Livre introuvable' });
      return;
    }
    res.status(200).json({ message: 'Livre supprimé de ta PAL' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Impossible de supprimer ce livre' });
  }
}
