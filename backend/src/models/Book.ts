import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import pool from '../config/database';
import { Book, BookStatus, CreateBookBody } from '../types/book';

type BookRow = Book & RowDataPacket;

export async function findAllByUser(userId: number): Promise<Book[]> {
  const [rows] = await pool.execute<BookRow[]>(
    'SELECT * FROM books WHERE user_id = ? ORDER BY added_at DESC',
    [userId],
  );
  return rows;
}

export async function findByIdAndUser(id: number, userId: number): Promise<Book | null> {
  const [rows] = await pool.execute<BookRow[]>(
    'SELECT * FROM books WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  return rows[0] ?? null;
}

// Renvoie l'id du livre créé
export async function create(userId: number, book: CreateBookBody): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO books (user_id, google_id, title, author, total_pages, cover_url) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, book.google_id, book.title, book.author, book.total_pages, book.cover_url],
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

// Renvoie false si aucun livre ne correspond
export async function remove(id: number, userId: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM books WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  return result.affectedRows > 0;
}
