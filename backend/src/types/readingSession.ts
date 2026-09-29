// Une ligne de la table reading_sessions
export interface ReadingSession {
  id: number;
  book_id: number;
  session_date: string; // 'YYYY-MM-DD' (formatée par le model)
  start_page: number;
  end_page: number;
  duration_minutes: number | null;
  comment: string | null;
}

// Données d'une session après validation (création et modification)
export interface ReadingSessionData {
  session_date: string;
  start_page: number;
  end_page: number;
  duration_minutes: number | null;
  comment: string | null;
}
