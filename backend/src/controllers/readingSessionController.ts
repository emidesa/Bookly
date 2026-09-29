import type { Request, Response } from 'express';
import * as Book from '../models/Book';
import * as ReadingSession from '../models/ReadingSession';
import type { Book as BookRecord } from '../types/book';
import type { ReadingSessionData } from '../types/readingSession';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const COMMENT_MAX_LENGTH = 1000;

// Champs reçus du client, encore non vérifiés
interface SessionInput {
  session_date?: unknown;
  start_page?: unknown;
  end_page?: unknown;
  duration_minutes?: unknown;
  comment?: unknown;
}

type ParseResult = { data: ReadingSessionData } | { error: string };

// Vérifie le format YYYY-MM-DD et que la date existe (rejette le 30 février)
function isValidDate(value: string): boolean {
  if (!DATE_REGEX.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Valide le body d'une session (création et modification)
function parseSessionData(input: SessionInput): ParseResult {
  const { session_date, start_page, end_page, duration_minutes, comment } = input;

  if (typeof session_date !== 'string' || !isValidDate(session_date)) {
    return { error: 'Date invalide (format AAAA-MM-JJ)' };
  }
  if (typeof start_page !== 'number' || !Number.isInteger(start_page) || start_page < 0) {
    return { error: 'Page de début invalide' };
  }
  if (typeof end_page !== 'number' || !Number.isInteger(end_page) || end_page < start_page) {
    return { error: 'La page de fin doit être supérieure ou égale à la page de début' };
  }

  let duration: number | null = null;
  if (duration_minutes !== undefined && duration_minutes !== null) {
    if (typeof duration_minutes !== 'number' || !Number.isInteger(duration_minutes) || duration_minutes <= 0) {
      return { error: 'Durée invalide' };
    }
    duration = duration_minutes;
  }

  let cleanComment: string | null = null;
  if (comment !== undefined && comment !== null) {
    if (typeof comment !== 'string' || comment.length > COMMENT_MAX_LENGTH) {
      return { error: `Commentaire invalide (${COMMENT_MAX_LENGTH} caractères maximum)` };
    }
    cleanComment = comment.trim() || null;
  }

  return { data: { session_date, start_page, end_page, duration_minutes: duration, comment: cleanComment } };
}

// total_pages à 0 ou null = nombre de pages inconnu : pas de limite
function exceedsBook(endPage: number, book: BookRecord): boolean {
  return book.total_pages ? endPage > book.total_pages : false;
}

// Statut automatique : jamais de retour en arrière
async function updateBookStatus(book: BookRecord, endPage: number, userId: number): Promise<void> {
  if (book.total_pages && endPage >= book.total_pages && book.status !== 'read') {
    await Book.updateStatus(book.id, userId, 'read');
  } else if (book.status === 'to_read') {
    await Book.updateStatus(book.id, userId, 'reading');
  }
}

// GET /api/books/:bookId/sessions
export async function getByBook(req: Request<{ bookId: string }>, res: Response): Promise<void> {
  const bookId = Number(req.params.bookId);
  if (!Number.isInteger(bookId)) {
    res.status(400).json({ message: 'Livre invalide' });
    return;
  }

  try {
    const book = await Book.findByIdAndUser(bookId, req.user!.id);
    if (!book) {
      res.status(404).json({ message: 'Livre introuvable' });
      return;
    }
    const sessions = await ReadingSession.findAllByBookAndUser(bookId, req.user!.id);
    res.status(200).json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Impossible de charger les sessions' });
  }
}

// POST /api/sessions
export async function create(req: Request, res: Response): Promise<void> {
  const body: SessionInput & { book_id?: unknown } = req.body ?? {};

  // 1. Forme du body
  const bookId = body.book_id;
  if (typeof bookId !== 'number' || !Number.isInteger(bookId)) {
    res.status(400).json({ message: 'Livre invalide' });
    return;
  }
  const parsed = parseSessionData(body);
  if ('error' in parsed) {
    res.status(400).json({ message: parsed.error });
    return;
  }

  try {
    // 2. Le livre appartient à l'utilisateur
    const book = await Book.findByIdAndUser(bookId, req.user!.id);
    if (!book) {
      res.status(404).json({ message: 'Livre introuvable' });
      return;
    }

    // 3. Cohérence avec le livre
    if (exceedsBook(parsed.data.end_page, book)) {
      res.status(400).json({ message: `Le livre ne compte que ${book.total_pages} pages` });
      return;
    }

    const id = await ReadingSession.create(book.id, parsed.data);
    await updateBookStatus(book, parsed.data.end_page, req.user!.id);
    const session = await ReadingSession.findByIdAndUser(id, req.user!.id);
    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Impossible d'enregistrer la session" });
  }
}

// PUT /api/sessions/:id
export async function update(req: Request<{ id: string }>, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Session invalide' });
    return;
  }
  const parsed = parseSessionData(req.body ?? {});
  if ('error' in parsed) {
    res.status(400).json({ message: parsed.error });
    return;
  }

  try {
    const session = await ReadingSession.findByIdAndUser(id, req.user!.id);
    const book = session ? await Book.findByIdAndUser(session.book_id, req.user!.id) : null;
    if (!book) {
      res.status(404).json({ message: 'Session introuvable' });
      return;
    }

    if (exceedsBook(parsed.data.end_page, book)) {
      res.status(400).json({ message: `Le livre ne compte que ${book.total_pages} pages` });
      return;
    }

    await ReadingSession.update(id, req.user!.id, parsed.data);
    await updateBookStatus(book, parsed.data.end_page, req.user!.id);
    const updated = await ReadingSession.findByIdAndUser(id, req.user!.id);
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Impossible de modifier la session' });
  }
}

// DELETE /api/sessions/:id (le statut du livre ne change pas)
export async function remove(req: Request<{ id: string }>, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Session invalide' });
    return;
  }

  try {
    const deleted = await ReadingSession.remove(id, req.user!.id);
    if (!deleted) {
      res.status(404).json({ message: 'Session introuvable' });
      return;
    }
    res.status(200).json({ message: 'Session supprimée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Impossible de supprimer la session' });
  }
}
