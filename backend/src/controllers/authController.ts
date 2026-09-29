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

type ParseResult = { value: string } | { error: string };

// Prénom : texte non vide, 50 caractères maximum (taille de la colonne)
function parseFirstName(firstName: unknown): ParseResult {
  if (typeof firstName !== 'string' || firstName.trim() === '' || firstName.trim().length > 50) {
    return { error: 'Prénom requis (50 caractères maximum)' };
  }
  return { value: firstName.trim() };
}

// Email : format valide, normalisé (espaces et majuscules)
function parseEmail(email: unknown): ParseResult {
  if (typeof email !== 'string') {
    return { error: 'Email requis' };
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { error: 'Email invalide' };
  }
  return { value: normalizedEmail };
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

  // 2. Prénom et format de l'email (normalisé)
  const parsedFirstName = parseFirstName(first_name);
  if ('error' in parsedFirstName) {
    res.status(400).json({ message: parsedFirstName.error });
    return;
  }
  const parsedEmail = parseEmail(email);
  if ('error' in parsedEmail) {
    res.status(400).json({ message: parsedEmail.error });
    return;
  }
  const firstName = parsedFirstName.value;
  const normalizedEmail = parsedEmail.value;

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

// PUT /api/auth/me : modifie le prénom et l'email de l'utilisateur connecté
export async function updateMe(req: Request, res: Response): Promise<void> {
  const { email, first_name }: { email?: unknown; first_name?: unknown } = req.body ?? {};
  const userId = req.user!.id;

  const parsedFirstName = parseFirstName(first_name);
  if ('error' in parsedFirstName) {
    res.status(400).json({ message: parsedFirstName.error });
    return;
  }
  const parsedEmail = parseEmail(email);
  if ('error' in parsedEmail) {
    res.status(400).json({ message: parsedEmail.error });
    return;
  }

  // Email déjà pris par un autre compte (garder le sien est autorisé)
  const owner = await User.findByEmail(parsedEmail.value);
  if (owner && owner.id !== userId) {
    res.status(409).json({ message: 'Cet email est déjà utilisé' });
    return;
  }

  try {
    const updated = await User.updateProfile(userId, parsedEmail.value, parsedFirstName.value);
    const user = updated ? await User.findById(userId) : null;
    if (!user) {
      res.status(401).json({ message: 'Compte introuvable' });
      return;
    }
    res.status(200).json(buildAuthResponse(user));
  } catch (error) {
    // Deux modifications simultanées vers le même email : la contrainte UNIQUE bloque
    if (isDuplicateEntry(error)) {
      res.status(409).json({ message: 'Cet email est déjà utilisé' });
      return;
    }
    throw error;
  }
}
