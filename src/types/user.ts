export type Role = 'reader' | 'admin';

// Utilisateur renvoyé par l'API (jamais de mot de passe)
export interface User {
  id: number;
  email: string;
  first_name: string;
  role: Role;
  created_at: string; // date au format texte dans le JSON
}

// Corps de POST /api/auth/login
export interface LoginBody {
  email: string;
  password: string;
}

// Corps de POST /api/auth/register
export interface RegisterBody {
  email: string;
  first_name: string;
  password: string;
}

// Réponse de POST /api/auth/login et GET /api/auth/me
export interface AuthResponse {
  token: string;
  user: User;
}

// Corps de PUT /api/auth/me (réponse : AuthResponse avec un token à jour)
export interface UpdateProfileBody {
  email: string;
  first_name: string;
}
