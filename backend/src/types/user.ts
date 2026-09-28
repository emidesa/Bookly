// Rôles possibles (ENUM de la table users)
export type Role = 'reader' | 'admin';

// Utilisateur tel qu'enregistré en base (table users)
export interface User {
  id: number;
  email: string;
  password: string; // hash bcrypt
  role: Role;
  created_at: Date;
}

// Utilisateur renvoyé au client : jamais le mot de passe
export type PublicUser = Omit<User, 'password'>;

// Contenu du JWT
export interface JwtPayload {
  id: number;
  role: Role;
}
