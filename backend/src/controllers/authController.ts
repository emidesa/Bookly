import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/jwt';
import * as User from '../models/User';
import type { JwtPayload, PublicUser } from '../types/user';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 10;

// Faux hash comparé quand l'email est inconnu : même temps de réponse
const DUMMY_HASH = bcrypt.hashSync('dummy-password', SALT_ROUNDS);

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

// Signe un token avec le rôle actuel et prépare la réponse { token, user }
function buildAuthResponse(user: PublicUser): { token: string; user: PublicUser } {
  const payload: JwtPayload = { id: user.id, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { token, user };
}

// Détecte l'erreur MySQL de doublon (contrainte UNIQUE)
function isDuplicateEntry(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY';
}

// POST /api/auth/register : crée un compte lecteur
export async function register(req: Request, res: Response): Promise<void> {
  const { email, first_name, password }: { email?: unknown; first_name?: unknown; password?: unknown } = req.body ?? {};

  // 1. Champs présents et de type texte
  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ message: 'Email et mot de passe requis' });
    return;
  }

  // Prénom : texte non vide, 50 caractères maximum (taille de la colonne)
  if (typeof first_name !== 'string' || first_name.trim() === '' || first_name.trim().length > 50) {
    res.status(400).json({ message: 'Prénom requis (50 caractères maximum)' });
    return;
  }
  const firstName = first_name.trim();

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
    const id = await User.create(normalizedEmail, firstName, hashedPassword);
    res.status(201).json({ id, email: normalizedEmail, first_name: firstName, role: 'reader' });
  } catch (error) {
    // Deux inscriptions simultanées : la contrainte UNIQUE bloque la seconde
    if (isDuplicateEntry(error)) {
      res.status(409).json({ message: 'Cet email est déjà utilisé' });
      return;
    }
    throw error;
  }
}

// POST /api/auth/login : renvoie un token et l'utilisateur
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password }: { email?: unknown; password?: unknown } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ message: 'Email et mot de passe requis' });
    return;
  }

  const user = await User.findByEmail(email.trim().toLowerCase());

  // Toujours un bcrypt.compare, même si l'email est inconnu (attaque temporelle)
  const isValid = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);

  // Même message dans les deux cas (énumération de comptes)
  if (!user || !isValid) {
    res.status(401).json({ message: 'Identifiants incorrects' });
    return;
  }

  const { password: _password, ...publicUser } = user;
  res.json(buildAuthResponse(publicUser));
}

// GET /api/auth/me : relit l'utilisateur en base et renvoie un token à jour
export async function me(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.user!.id);

  // Compte supprimé depuis la création du token
  if (!user) {
    res.status(401).json({ message: 'Compte introuvable' });
    return;
  }

  res.json(buildAuthResponse(user));
}
