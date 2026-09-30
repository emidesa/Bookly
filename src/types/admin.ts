import type { User } from './user';

// Ligne de GET /api/admin/users : utilisateur + nombre de livres dans sa PAL
export interface AdminUser extends User {
  book_count: number;
}

// Réponse de GET /api/admin/stats
export interface AdminStats {
  total_users: number;
  total_books: number;
  books_to_read: number;
  books_reading: number;
  books_read: number;
  total_sessions: number;
  total_pages_read: number;
  total_reading_minutes: number;
  users_this_month: number;
  users_last_month: number;
}
