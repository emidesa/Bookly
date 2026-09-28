import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import * as User from '../models/User';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 10;

// Vérifie les critères du mot de passe ; renvoie un message d'erreur ou null
function checkPassword(password: string): string | null {
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return 'Le mot de passe doit contenir entre 8 et 72 caractères';
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre';
  }
  return null;
}

// Détecte l'erreur MySQL de doublon (contrainte UNIQUE)
function isDuplicateEntry(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY';
}

// POST /auth/register : crée un compte lecteur
export async function register(req: Request, res: Response): Promise<void> {
  const { email, password }: { email?: unknown; password?: unknown } = req.body ?? {};

  // 1. Champs présents et de type texte
  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ message: 'Email et mot de passe requis' });
    return;
  }

  // 2. Format de l'email (normalisé)
  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    res.status(400).json({ message: 'Email invalide' });
    return;
  }

  // 3. Critères du mot de passe
  const passwordError = checkPassword(password);
  if (passwordError) {
    res.status(400).json({ message: passwordError });
    return;
  }

  // 4. Email déjà utilisé
  if (await User.findByEmail(normalizedEmail)) {
    res.status(409).json({ message: 'Cet email est déjà utilisé' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const id = await User.create(normalizedEmail, hashedPassword);
    res.status(201).json({ id, email: normalizedEmail, role: 'reader' });
  } catch (error) {
    // Deux inscriptions simultanées : la contrainte UNIQUE bloque la seconde
    if (isDuplicateEntry(error)) {
      res.status(409).json({ message: 'Cet email est déjà utilisé' });
      return;
    }
    throw error;
  }
}
