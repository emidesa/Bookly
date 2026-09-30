import { GoogleBookResult, GoogleVolume } from '../types/googleBook';

const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes';

function getApiKey(): string {
  const apiKey = process.env.GOOGLE_BOOKS_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_BOOKS_KEY manquante dans le .env');
  }
  return apiKey;
}

async function fetchVolumes(q: string, maxResults: number): Promise<GoogleVolume[]> {
  const params = new URLSearchParams({ q, maxResults: String(maxResults), key: getApiKey() });
  const response = await fetch(`${GOOGLE_BOOKS_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Erreur Google Books : ${response.status}`);
  }
  const data = (await response.json()) as { items?: GoogleVolume[] };
  return data.items ?? [];
}

// Fiche détaillée d'un livre : plus complète que les résultats de recherche (pages, résumé)
async function fetchVolumeById(googleId: string): Promise<GoogleVolume | null> {
  const params = new URLSearchParams({ key: getApiKey() });
  const response = await fetch(`${GOOGLE_BOOKS_URL}/${encodeURIComponent(googleId)}?${params}`);
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as GoogleVolume;
}

// Google renvoie parfois 0 page pour les livres récents : 0 veut dire « inconnu »
function getPageCount(volumeInfo: GoogleVolume['volumeInfo']): number | null {
  if (volumeInfo.pageCount !== undefined && volumeInfo.pageCount > 0) {
    return volumeInfo.pageCount;
  }
  if (volumeInfo.printedPageCount !== undefined && volumeInfo.printedPageCount > 0) {
    return volumeInfo.printedPageCount;
  }
  return null;
}

// Google renvoie parfois du HTML (<p>, <br>, &quot;...) : on garde du texte simple
function cleanDescription(description: string | undefined): string | null {
  if (description === undefined) {
    return null;
  }
  let text = description;
  text = text.replace(/<br\s*\/?>/gi, '\n'); // retour à la ligne
  text = text.replace(/<\/p>/gi, '\n'); // fin de paragraphe
  text = text.replace(/<[^>]*>/g, ''); // toutes les autres balises
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&amp;/g, '&');
  text = text.trim();
  if (text === '') {
    return null;
  }
  return text;
}

function toGoogleBookResult({ id, volumeInfo }: GoogleVolume): GoogleBookResult {
  return {
    google_id: id,
    title: volumeInfo.title ?? 'Titre inconnu',
    author: volumeInfo.authors?.join(', ') ?? null,
    total_pages: getPageCount(volumeInfo),
    // iOS bloque les images en http, thumbnail = image en miniature
    cover_url: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') ?? null,
    description: cleanDescription(volumeInfo.description),
  };
}

export async function searchBooks(query: string): Promise<GoogleBookResult[]> {
  return (await fetchVolumes(query, 20)).map(toGoogleBookResult);
}

// La recherche par ISBN renvoie une fiche allégée pour les livres récents (0 page, pas de résumé) :
// on la complète avec la fiche détaillée du même livre
export async function findBookByIsbn(isbn: string): Promise<GoogleBookResult | null> {
  let volumes = await fetchVolumes(`isbn:${isbn}`, 1);
  // Google répond parfois vide pour un ISBN qui existe : un second essai avant de conclure
  if (volumes.length === 0) {
    volumes = await fetchVolumes(`isbn:${isbn}`, 1);
  }
  const volume = volumes[0];
  if (!volume) {
    return null;
  }

  const detail = await fetchVolumeById(volume.id);
  if (detail === null) {
    return toGoogleBookResult(volume);
  }
  // Les champs de la fiche détaillée remplacent ceux de la recherche ; les champs absents sont gardés
  return toGoogleBookResult({ id: volume.id, volumeInfo: { ...volume.volumeInfo, ...detail.volumeInfo } });
}
