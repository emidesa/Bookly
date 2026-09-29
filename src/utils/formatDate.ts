// « 2026-09-12 » → « 12 septembre 2026 »
export function formatDate(dateText: string): string {
  const date = new Date(dateText);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
