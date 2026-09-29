export type BookStatus = 'to_read' | 'reading' | 'read';

// Libellés affichés pour chaque statut
export const statusLabels: Record<BookStatus, string> = {
  to_read: 'À lire',
  reading: 'En cours',
  read: 'Lu',
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
