import { GoogleBookResult, GoogleVolume } from '../types/googleBook';

const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes';

async function fetchVolumes(q: string, maxResults: number): Promise<GoogleVolume[]> {
  const apiKey = process.env.GOOGLE_BOOKS_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_BOOKS_KEY manquante dans le .env');
  }

  const params = new URLSearchParams({ q, maxResults: String(maxResults), key: apiKey });
  const response = await fetch(`${GOOGLE_BOOKS_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Erreur Google Books : ${response.status}`);
  }
  const data = (await response.json()) as { items?: GoogleVolume[] };
  return data.items ?? [];
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
    total_pages: volumeInfo.pageCount ?? null,
    // iOS bloque les images en http, thumbnail = image en miniature
    cover_url: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') ?? null,
    description: cleanDescription(volumeInfo.description),
  };
}

export async function searchBooks(query: string): Promise<GoogleBookResult[]> {
  return (await fetchVolumes(query, 20)).map(toGoogleBookResult);
}

export async function findBookByIsbn(isbn: string): Promise<GoogleBookResult | null> {
  const [volume] = await fetchVolumes(`isbn:${isbn}`, 1);
  return volume ? toGoogleBookResult(volume) : null;
}
