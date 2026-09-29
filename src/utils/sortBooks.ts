import { Book, BookStatus } from '../types/book';

// Filtres et tri de la PAL : faits dans l'appli, sans appel à l'API

export type StatusFilter = BookStatus | 'all';
export type SortOption = 'recent' | 'title' | 'author';

export const statusFilters: StatusFilter[] = ['all', 'to_read', 'reading', 'read'];
export const sortOptions: SortOption[] = ['recent', 'title', 'author'];

// Libellés des filtres (au pluriel : « Lus »)
export const filterLabels: Record<StatusFilter, string> = {
  all: 'Tous',
  to_read: 'À lire',
  reading: 'En cours',
  read: 'Lus',
};

export const sortLabels: Record<SortOption, string> = {
  recent: 'Récents',
  title: 'Titre',
  author: 'Auteur',
};

// Filtre par statut puis trie la PAL
export function getVisibleBooks(books: Book[], filter: StatusFilter, sort: SortOption): Book[] {
  let result = books;

  if (filter !== 'all') {
    result = books.filter((book) => book.status === filter);
  }

  // sort() modifie le tableau : on trie une copie
  const sorted = result.slice();

  if (sort === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title, 'fr'));
  }
  if (sort === 'author') {
    sorted.sort((a, b) => {
      const authorA = a.author === null ? '' : a.author;
      const authorB = b.author === null ? '' : b.author;
      return authorA.localeCompare(authorB, 'fr');
    });
  }
  if (sort === 'recent') {
    sorted.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime());
  }

  return sorted;
}
