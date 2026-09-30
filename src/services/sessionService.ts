import type { CreateSessionBody, ReadingSession, UpdateSessionBody } from '../types/readingSession';
import { api } from './api';

// Sessions d'un livre, de la plus récente à la plus ancienne
export function getSessions(bookId: number): Promise<ReadingSession[]> {
  return api.get<ReadingSession[]>('/books/' + bookId + '/sessions');
}

// Le statut du livre est mis à jour par le serveur (à lire → en cours → lu)
export function createSession(session: CreateSessionBody): Promise<ReadingSession> {
  return api.post<ReadingSession>('/sessions', session);
}

export function updateSession(id: number, session: UpdateSessionBody): Promise<ReadingSession> {
  return api.put<ReadingSession>('/sessions/' + id, session);
}

export function deleteSession(id: number): Promise<{ message: string }> {
  return api.delete<{ message: string }>('/sessions/' + id);
}
