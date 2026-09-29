import { ReadingSession } from '../types/readingSession';

// PROVISOIRE : à supprimer quand l'API des sessions sera branchée (Personne B)
export const sampleSessions: ReadingSession[] = [
  { id: 1, book_id: 2, session_date: '2026-09-12', start_page: 124, end_page: 209, duration_minutes: 45, comment: null },
  { id: 2, book_id: 2, session_date: '2026-09-11', start_page: 70, end_page: 124, duration_minutes: 35, comment: null },
  { id: 3, book_id: 2, session_date: '2026-09-10', start_page: 1, end_page: 70, duration_minutes: 50, comment: null },
  { id: 4, book_id: 5, session_date: '2026-08-30', start_page: 1, end_page: 320, duration_minutes: 240, comment: null },
  { id: 5, book_id: 1, session_date: '2026-09-02', start_page: 1, end_page: 113, duration_minutes: 90, comment: null },
];
