import { getLocaleTag } from '../i18n/i18n';

// « 2026-09-12 » → « 12 septembre 2026 » ou « 12 September 2026 » selon la langue
export function formatDate(dateText: string): string {
  const date = new Date(dateText);
  return date.toLocaleDateString(getLocaleTag(), { day: 'numeric', month: 'long', year: 'numeric' });
}
