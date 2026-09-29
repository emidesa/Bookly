import type { RowDataPacket } from 'mysql2';
import pool from '../config/database';
import type { AdminStats, UserStats } from '../types/stats';

type AdminStatsRow = AdminStats & RowDataPacket;
type UserStatsRow = UserStats & RowDataPacket;

// Compteurs globaux en une seule requête (CAST : SUM renverrait une chaîne)
export async function getGlobalStats(): Promise<AdminStats> {
  const [rows] = await pool.execute<AdminStatsRow[]>(`
    SELECT
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM books) AS total_books,
      (SELECT COUNT(*) FROM books WHERE status = 'to_read') AS books_to_read,
      (SELECT COUNT(*) FROM books WHERE status = 'reading') AS books_reading,
      (SELECT COUNT(*) FROM books WHERE status = 'read') AS books_read,
      (SELECT COUNT(*) FROM reading_sessions) AS total_sessions,
      (SELECT CAST(COALESCE(SUM(end_page - start_page), 0) AS SIGNED) FROM reading_sessions) AS total_pages_read,
      (SELECT CAST(COALESCE(SUM(duration_minutes), 0) AS SIGNED) FROM reading_sessions) AS total_reading_minutes
  `);
  return rows[0];
}

// Livres lus et pages lues d'un utilisateur (jointure books pour les sessions)
export async function getUserStats(userId: number): Promise<UserStats> {
  const [rows] = await pool.execute<UserStatsRow[]>(
    `SELECT
      (SELECT COUNT(*) FROM books WHERE user_id = ? AND status = 'read') AS books_read,
      (SELECT CAST(COALESCE(SUM(rs.end_page - rs.start_page), 0) AS SIGNED)
         FROM reading_sessions rs
         JOIN books b ON b.id = rs.book_id
         WHERE b.user_id = ?) AS pages_read`,
    [userId, userId],
  );
  return rows[0];
}
