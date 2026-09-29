import { Request, Response } from 'express';
import * as Book from '../models/Book';
import { BookStatus, BookWithProgress, CreateBookBody, type Book as BookRecord } from '../types/book';

const statusList: BookStatus[] = ['to_read', 'reading', 'read'];

// Logique métier : progression de lecture d'un livre
// - page actuelle = plus haute page atteinte dans les sessions (pages_read)
// - un livre marqué « lu » est terminé : page actuelle = dernière page
// - pourcentage et pages restantes seulement si le nombre de pages est connu
function addProgress(book: BookRecord): BookWithProgress {
  const totalPages = book.total_pages;

  let currentPage = 0;
  if (book.pages_read !== null) {
    currentPage = book.pages_read;
  }

  if (totalPages === null || totalPages <= 0) {
    return { ...book, progress_percent: null, current_page: currentPage, remaining_pages: null };
  }

  if (book.status === 'read' || currentPage > totalPages) {
    currentPage = totalPages;
  }
  const percent = Math.round((currentPage * 100) / totalPages);

  return { ...book, progress_percent: percent, current_page: currentPage, remaining_pages: totalPages - currentPage };
}

// Vérifie l'id de l'adresse ; répond 400 et renvoie null s'il est invalide
function parseBookId(req: Request<{ id: string }>, res: Response): number | null {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Livre invalide' });
    return null;
  }
  return id;
}

// Vérifie le corps de POST /api/books : renvoie le message d'erreur, ou null si tout est bon
// Le body vient du client : on vérifie le vrai type de chaque champ et la longueur des colonnes
function validateBookBody(body: CreateBookBody | undefined): string | null {
  if (body === undefined) {
    return 'Informations du livre incomplètes';
  }
  const { google_id, title, author, total_pages, cover_url, description } = body;

  if (typeof google_id !== 'string' || google_id.trim() === '' || typeof title !== 'string' || title.trim() === '') {
    return 'Informations du livre incomplètes';
  }
  // Longueurs maximales des colonnes (sinon MySQL refuse et renvoie une erreur 500)
  if (google_id.length > 50 || title.length > 255) {
    return 'Informations du livre trop longues';
  }
  if (author !== undefined && author !== null && (typeof author !== 'string' || author.length > 255)) {
    return 'Auteur invalide';
  }
  // Nombre entier positif (pas -12 ni 3.7)
  if (total_pages !== undefined && total_pages !== null && (!Number.isInteger(total_pages) || total_pages < 0)) {
    return 'Nombre de pages invalide';
  }
  if (cover_url !== undefined && cover_url !== null && (typeof cover_url !== 'string' || cover_url.length > 500)) {
    return 'Couverture invalide';
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    return 'Résumé invalide';
  }
  return null;
}

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
    res.status(200).json(books.map(addProgress));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Impossible de charger ta PAL' });
  }
}

// GET /api/books/:id
export async function getOne(req: Request<{ id: string }>, res: Response): Promise<void> {
  const id = parseBookId(req, res);
  if (id === null) {
    return;
  }

  try {
    const book = await Book.findByIdAndUser(id, req.user!.id);
    if (!book) {
      res.status(404).json({ message: 'Livre introuvable' });
      return;
    }
    res.status(200).json(addProgress(book));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Impossible de charger ce livre' });
  }
}

// POST /api/books
export async function create(req: Request<{}, {}, CreateBookBody>, res: Response): Promise<void> {
  const errorMessage = validateBookBody(req.body);
  if (errorMessage !== null) {
    res.status(400).json({ message: errorMessage });
    return;
  }
  const { google_id, title, author, total_pages, cover_url, description } = req.body;

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
    if (!book) {
      res.status(500).json({ message: "Impossible d'ajouter ce livre" });
      return;
    }
    res.status(201).json(addProgress(book));
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
  const id = parseBookId(req, res);
  if (id === null) {
    return;
  }
  const { status } = req.body ?? {};
  if (typeof status !== 'string' || !statusList.includes(status)) {
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
    if (!book) {
      res.status(404).json({ message: 'Livre introuvable' });
      return;
    }
    res.status(200).json(addProgress(book));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Impossible de modifier ce livre' });
  }
}

// DELETE /api/books/:id
export async function remove(req: Request<{ id: string }>, res: Response): Promise<void> {
  const id = parseBookId(req, res);
  if (id === null) {
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
