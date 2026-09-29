// Session de lecture renvoyée par l'API
export interface ReadingSession {
  id: number;
  book_id: number;
  session_date: string; // 'YYYY-MM-DD'
  start_page: number;
  end_page: number;
  duration_minutes: number | null;
  comment: string | null;
}

// Corps de POST /api/sessions (les pages sont des nombres, pas du texte)
export interface CreateSessionBody {
  book_id: number;
  session_date: string;
  start_page: number;
  end_page: number;
  duration_minutes: number | null;
  comment: string | null;
}

// Corps de PUT /api/sessions/:id : le livre ne change pas
export type UpdateSessionBody = Omit<CreateSessionBody, 'book_id'>;
