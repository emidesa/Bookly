import { GoogleBookResult } from './googleBook';

export type BookStatus = 'to_read' | 'reading' | 'read';

// Une ligne de la table books
export interface Book {
  id: number;
  user_id: number;
  google_id: string;
  title: string;
  author: string | null;
  total_pages: number | null;
  cover_url: string | null;
  description: string | null;
  status: BookStatus;
  added_at: Date;
  pages_read: number | null; // calculé depuis les sessions (pas une colonne)
}

// Livre renvoyé au client : colonnes + progression calculée par le controller (logique métier)
export interface BookWithProgress extends Book {
  progress_percent: number | null; // null si le nombre de pages est inconnu
  current_page: number;
  remaining_pages: number | null; // null si le nombre de pages est inconnu
}

// Corps de POST /api/books : un livre trouvé via Google
export type CreateBookBody = GoogleBookResult;

// Livre populaire : présent dans « readers » PAL (GET /api/books/trending)
export interface TrendingBook extends GoogleBookResult {
  readers: number;
}
