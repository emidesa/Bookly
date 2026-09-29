import { api } from './api';
import { Book, BookStatus, GoogleBookResult, TrendingBook } from '../types/book';

// Appels à l'API pour les livres (PAL) et Google Books
// En cas d'erreur, api lève une ApiError avec le message du backend (ex. 409 « déjà dans ta PAL »)

export function getBooks(): Promise<Book[]> {
  return api.get<Book[]>('/books');
}

export function getBook(id: number): Promise<Book> {
  return api.get<Book>('/books/' + id);
}

export function addBook(book: GoogleBookResult): Promise<Book> {
  return api.post<Book>('/books', book);
}

export function updateBookStatus(id: number, status: BookStatus): Promise<Book> {
  return api.put<Book>('/books/' + id, { status: status });
}

export function deleteBook(id: number): Promise<{ message: string }> {
  return api.delete<{ message: string }>('/books/' + id);
}

export function getTrending(): Promise<TrendingBook[]> {
  return api.get<TrendingBook[]>('/books/trending');
}

// encodeURIComponent : accents, espaces et « & » passent correctement dans l'adresse
export function searchGoogle(query: string): Promise<GoogleBookResult[]> {
  return api.get<GoogleBookResult[]>('/google/search?q=' + encodeURIComponent(query));
}

export function findByIsbn(isbn: string): Promise<GoogleBookResult> {
  return api.get<GoogleBookResult>('/google/isbn/' + encodeURIComponent(isbn));
}
