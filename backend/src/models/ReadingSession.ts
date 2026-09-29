import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';
import type { ReadingSession, ReadingSessionData } from '../types/readingSession';

type ReadingSessionRow = ReadingSession & RowDataPacket;

// Colonnes renvoyées ; la date en texte évite le décalage de fuseau horaire
const COLUMNS = `rs.id, rs.book_id, DATE_FORMAT(rs.session_date, '%Y-%m-%d') AS session_date,
  rs.start_page, rs.end_page, rs.duration_minutes, rs.comment`;

// Sessions d'un livre, seulement s'il appartient à l'utilisateur (jointure books)
export async function findAllByBookAndUser(bookId: number, userId: number): Promise<ReadingSession[]> {
  const [rows] = await pool.execute<ReadingSessionRow[]>(
    `SELECT ${COLUMNS} FROM reading_sessions rs
     JOIN books b ON b.id = rs.book_id
     WHERE rs.book_id = ? AND b.user_id = ?
     ORDER BY rs.session_date DESC, rs.id DESC`,
    [bookId, userId],
  );
  return rows;
}

// Une session, seulement si son livre appartient à l'utilisateur
export async function findByIdAndUser(id: number, userId: number): Promise<ReadingSession | null> {
  const [rows] = await pool.execute<ReadingSessionRow[]>(
    `SELECT ${COLUMNS} FROM reading_sessions rs
     JOIN books b ON b.id = rs.book_id
     WHERE rs.id = ? AND b.user_id = ?`,
    [id, userId],
  );
  return rows[0] ?? null;
}

// Renvoie l'id de la session créée (propriété du livre vérifiée par le controller)
export async function create(bookId: number, data: ReadingSessionData): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO reading_sessions (book_id, session_date, start_page, end_page, duration_minutes, comment)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [bookId, data.session_date, data.start_page, data.end_page, data.duration_minutes, data.comment],
  );
  return result.insertId;
}

// Renvoie false si aucune session de l'utilisateur ne correspond
export async function update(id: number, userId: number, data: ReadingSessionData): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE reading_sessions rs
     JOIN books b ON b.id = rs.book_id
     SET rs.session_date = ?, rs.start_page = ?, rs.end_page = ?, rs.duration_minutes = ?, rs.comment = ?
     WHERE rs.id = ? AND b.user_id = ?`,
    [data.session_date, data.start_page, data.end_page, data.duration_minutes, data.comment, id, userId],
  );
  return result.affectedRows > 0;
}

// Renvoie false si aucune session de l'utilisateur ne correspond
export async function remove(id: number, userId: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE rs FROM reading_sessions rs
     JOIN books b ON b.id = rs.book_id
     WHERE rs.id = ? AND b.user_id = ?`,
    [id, userId],
  );
  return result.affectedRows > 0;
}
