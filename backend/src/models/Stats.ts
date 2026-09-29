import type { RowDataPacket } from 'mysql2';
import pool from '../config/database';
import type { AdminStats } from '../types/stats';

type AdminStatsRow = AdminStats & RowDataPacket;

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
