import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';
import type { PublicUser, User } from '../types/user';

// Lignes renvoyées par mysql2 pour la table users
type UserRow = User & RowDataPacket;
type PublicUserRow = PublicUser & RowDataPacket;

// Cherche un utilisateur par email (null si absent)
export async function findByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.execute<UserRow[]>('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] ?? null;
}

// Crée un lecteur et renvoie son id (le rôle vient du DEFAULT de la table)
export async function create(email: string, hashedPassword: string): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [email, hashedPassword],
  );
  return result.insertId;
}

// Liste tous les utilisateurs, sans mot de passe (admin)
export async function findAll(): Promise<PublicUser[]> {
  const [rows] = await pool.execute<PublicUserRow[]>(
    'SELECT id, email, role, created_at FROM users ORDER BY created_at DESC',
  );
  return rows;
}

// Supprime un utilisateur ; renvoie false s'il n'existait pas (admin)
export async function deleteById(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
