// Statistiques globales de l'application (écran admin)
export interface AdminStats {
  total_users: number;
  total_books: number;
  books_to_read: number;
  books_reading: number;
  books_read: number;
  total_sessions: number;
  total_pages_read: number;
  total_reading_minutes: number;
  users_this_month: number; // inscrits depuis le 1er du mois
  users_last_month: number; // inscrits le mois précédent
}

// Statistiques de l'utilisateur connecté (écran Profil)
export interface UserStats {
  books_read: number;
  pages_read: number;
}
