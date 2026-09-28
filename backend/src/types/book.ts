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
  status: BookStatus;
  added_at: Date;
}

// Corps de POST /api/books : un livre trouvé via Google
export type CreateBookBody = GoogleBookResult;
