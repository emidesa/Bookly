import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import pool from '../config/database';
import { Book, BookStatus, CreateBookBody, TrendingBook } from '../types/book';

type BookRow = Book & RowDataPacket;
type TrendingBookRow = TrendingBook & RowDataPacket;

// pages_read : plus haute page atteinte dans les sessions du livre (NULL si aucune session)
const SELECT_BOOK_WITH_PROGRESS = `
  SELECT books.*,
    (SELECT MAX(reading_sessions.end_page) FROM reading_sessions WHERE reading_sessions.book_id = books.id) AS pages_read
  FROM books`;

export async function findAllByUser(userId: number): Promise<Book[]> {
  const [rows] = await pool.execute<BookRow[]>(
    SELECT_BOOK_WITH_PROGRESS + ' WHERE books.user_id = ? ORDER BY books.added_at DESC',
    [userId],
  );
  return rows;
}

export async function findByIdAndUser(id: number, userId: number): Promise<Book | null> {
  const [rows] = await pool.execute<BookRow[]>(
    SELECT_BOOK_WITH_PROGRESS + ' WHERE books.id = ? AND books.user_id = ?',
    [id, userId],
  );
  return rows[0] ?? null;
}

// Renvoie l'id du livre créé
export async function create(userId: number, book: CreateBookBody): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO books (user_id, google_id, title, author, total_pages, cover_url, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, book.google_id, book.title, book.author, book.total_pages, book.cover_url, book.description],
  );
  return result.insertId;
}

// Renvoie false si aucun livre ne correspond
export async function updateStatus(id: number, userId: number, status: BookStatus): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE books SET status = ? WHERE id = ? AND user_id = ?',
    [status, id, userId],
  );
  return result.affectedRows > 0;
}

// Les 10 livres présents dans le plus de PAL (totaux uniquement, aucune donnée personnelle)
// MAX() choisit une valeur par groupe (ANY_VALUE n'existe pas sur MariaDB)
export async function findTrending(): Promise<TrendingBook[]> {
  const [rows] = await pool.execute<TrendingBookRow[]>(
    `SELECT google_id, MAX(title) AS title, MAX(author) AS author,
       MAX(total_pages) AS total_pages, MAX(cover_url) AS cover_url, MAX(description) AS description,
       COUNT(*) AS readers
     FROM books
     GROUP BY google_id
     ORDER BY readers DESC, title ASC
     LIMIT 10`,
  );
  return rows;
}

// Renvoie false si aucun livre ne correspond
export async function remove(id: number, userId: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM books WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  return result.affectedRows > 0;
}