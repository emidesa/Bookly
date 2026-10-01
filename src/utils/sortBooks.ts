import type { TranslationKey } from '../i18n/i18n';
import { Book, BookStatus } from '../types/book';

// Filtres et tri de la PAL : faits dans l'appli, sans appel à l'API

export type StatusFilter = BookStatus | 'all';
export type SortOption = 'recent' | 'title' | 'author';

export const statusFilters: StatusFilter[] = ['all', 'to_read', 'reading', 'read'];
export const sortOptions: SortOption[] = ['recent', 'title', 'author'];

// Clés de traduction des filtres (au pluriel en français : « Lus »)
export const filterKeys: Record<StatusFilter, TranslationKey> = {
  all: 'filters.all',
  to_read: 'filters.to_read',
  reading: 'filters.reading',
  read: 'filters.read',
};

export const sortKeys: Record<SortOption, TranslationKey> = {
  recent: 'sort.recent',
  title: 'sort.title',
  author: 'sort.author',
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
