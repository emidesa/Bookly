// Réponse brute de l'API Google Books (champs utilisés uniquement)
export interface GoogleVolume {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    pageCount?: number;
    imageLinks?: { thumbnail?: string };
    description?: string; // peut contenir des balises HTML
  };
}

// Livre renvoyé par notre API (mêmes noms que la table books)
export interface GoogleBookResult {
  google_id: string;
  title: string;
  author: string | null;
  total_pages: number | null;
  cover_url: string | null;
  description: string | null; // résumé en texte simple
}
