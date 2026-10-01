import type { TranslationKey } from '../i18n/i18n';

export type BookStatus = 'to_read' | 'reading' | 'read';

// Clé de traduction du libellé de chaque statut (« À lire » / « To read »...)
export const statusKeys: Record<BookStatus, TranslationKey> = {
  to_read: 'status.to_read',
  reading: 'status.reading',
  read: 'status.read',
};

// Livre de la PAL, renvoyé par GET /api/books
export interface Book {
  id: number;
  user_id: number;
  google_id: string;
  title: string;
  author: string | null;
  total_pages: number | null;
  cover_url: string | null;
  description: string | null; // résumé (null si Google n'en a pas)
  status: BookStatus;
  added_at: string; // date au format texte dans le JSON
  pages_read: number | null; // plus haute page lue (sessions), null si aucune session
  // Progression calculée par le backend (logique métier dans le controller)
  progress_percent: number | null; // null si le nombre de pages est inconnu
  current_page: number;
  remaining_pages: number | null;
}

// Livre trouvé via Google, renvoyé par /api/google/search et /api/google/isbn
export interface GoogleBookResult {
  google_id: string;
  title: string;
  author: string | null;
  total_pages: number | null;
  cover_url: string | null;
  description: string | null;
}

// Livre populaire, renvoyé par /api/books/trending (readers = nombre de PAL)
export interface TrendingBook extends GoogleBookResult {
  readers: number;
}
