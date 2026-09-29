// Session de lecture (table reading_sessions) — type de base, à compléter par la Personne B
export interface ReadingSession {
  id: number;
  book_id: number;
  session_date: string; // date au format texte dans le JSON
  start_page: number;
  end_page: number;
  duration_minutes: number | null;
  comment: string | null;
}
