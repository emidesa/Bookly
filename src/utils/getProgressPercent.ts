import { BookStatus } from '../types/book';

// Pourcentage lu (0 à 100), ou null si le nombre de pages est inconnu
export function getProgressPercent(status: BookStatus, pagesRead: number | null, totalPages: number | null): number | null {
  if (totalPages === null || totalPages <= 0) {
    return null;
  }
  if (status === 'read') {
    return 100;
  }
  if (pagesRead === null) {
    return 0;
  }
  const percent = Math.round((pagesRead * 100) / totalPages);
  if (percent > 100) {
    return 100;
  }
  return percent;
}
