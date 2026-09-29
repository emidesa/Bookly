import { GoogleBookResult, TrendingBook } from '../types/book';

// PROVISOIRE : à supprimer quand l'API sera branchée (bookService)
function coverUrl(googleId: string): string {
  return 'https://books.google.com/books/content?id=' + googleId + '&printsec=frontcover&img=1&zoom=1&source=gbs_api';
}

// Remplacé par GET /api/books/trending
export const sampleTrending: TrendingBook[] = [
  { google_id: 'trend-tsubaki', title: 'La papeterie Tsubaki', author: 'Ito Ogawa', total_pages: 288, cover_url: null, description: 'À Kamakura, Hatoko reprend la petite papeterie de sa grand-mère et devient écrivain public. Lettre après lettre, elle aide ses clients à dire ce qu\'ils n\'osent pas écrire.', readers: 42 },
  { google_id: 'NFWzngEACAAJ', title: 'Le petit prince', author: 'Antoine de Saint-Exupéry', total_pages: 113, cover_url: coverUrl('NFWzngEACAAJ'), description: 'Un aviateur tombé en panne dans le désert rencontre un petit prince venu d\'une autre planète. Au fil de ses récits de voyage, un conte poétique sur l\'amitié, l\'amour et le regard des enfants sur le monde des adultes.', readers: 37 },
  { google_id: 'trend-klara', title: 'Klara et le Soleil', author: 'Kazuo Ishiguro', total_pages: 384, cover_url: null, description: 'Klara, une amie artificielle, observe le monde depuis la vitrine d\'un magasin avant d\'être choisie par Josie, une adolescente fragile. Un roman sur l\'amour, la solitude et ce qui fait de nous des humains.', readers: 29 },
  { google_id: 'I_ApAQAAMAAJ', title: "Harry Potter à l'école des sorciers", author: 'J. K. Rowling', total_pages: 326, cover_url: coverUrl('I_ApAQAAMAAJ'), description: 'Le jour de ses onze ans, Harry Potter apprend qu\'il est un sorcier et entre à l\'école de Poudlard. Il y découvre la magie, l\'amitié et le mystère qui entoure la mort de ses parents.', readers: 25 },
  { google_id: 'trend-fleurs', title: "Changer l'eau des fleurs", author: 'Valérie Perrin', total_pages: 672, cover_url: null, description: 'Violette Toussaint est garde-cimetière dans un petit village de Bourgogne. Entre les visiteurs, les confidences et un secret qui refait surface, un roman lumineux sur le deuil et l\'espoir.', readers: 18 },
];

// Remplacé par GET /api/google/search?q=... (ici : filtre sur le titre et l'auteur)
const searchPool: GoogleBookResult[] = [
  { google_id: 'I_ApAQAAMAAJ', title: "Harry Potter à l'école des sorciers", author: 'J. K. Rowling', total_pages: 326, cover_url: coverUrl('I_ApAQAAMAAJ'), description: 'Le jour de ses onze ans, Harry Potter apprend qu\'il est un sorcier et entre à l\'école de Poudlard. Il y découvre la magie, l\'amitié et le mystère qui entoure la mort de ses parents.' },
  { google_id: '6fBjvgAACAAJ', title: 'Harry Potter et les Reliques de la Mort', author: 'Joanne Kathleen Rowling', total_pages: 816, cover_url: coverUrl('6fBjvgAACAAJ'), description: 'Harry, Ron et Hermione quittent Poudlard pour une dernière quête : trouver et détruire les objets qui rendent Voldemort immortel, avant l\'affrontement final.' },
  { google_id: 'YoVZxxIVvnQC', title: 'Harry Potter et le Prince de Sang-Mêlé', author: 'J.K. Rowling', total_pages: 752, cover_url: coverUrl('YoVZxxIVvnQC'), description: 'Pendant sa sixième année, Harry découvre un vieux manuel annoté par un mystérieux « Prince de Sang-Mêlé » et plonge dans le passé de Voldemort avec Dumbledore.' },
  { google_id: 'NFWzngEACAAJ', title: 'Le petit prince', author: 'Antoine de Saint-Exupéry', total_pages: 113, cover_url: coverUrl('NFWzngEACAAJ'), description: 'Un aviateur tombé en panne dans le désert rencontre un petit prince venu d\'une autre planète. Au fil de ses récits de voyage, un conte poétique sur l\'amitié, l\'amour et le regard des enfants sur le monde des adultes.' },
  { google_id: 'trend-tsubaki', title: 'La papeterie Tsubaki', author: 'Ito Ogawa', total_pages: 288, cover_url: null, description: 'À Kamakura, Hatoko reprend la petite papeterie de sa grand-mère et devient écrivain public. Lettre après lettre, elle aide ses clients à dire ce qu\'ils n\'osent pas écrire.' },
  { google_id: 'trend-klara', title: 'Klara et le Soleil', author: 'Kazuo Ishiguro', total_pages: 384, cover_url: null, description: 'Klara, une amie artificielle, observe le monde depuis la vitrine d\'un magasin avant d\'être choisie par Josie, une adolescente fragile. Un roman sur l\'amour, la solitude et ce qui fait de nous des humains.' },
  { google_id: 'trend-fleurs', title: "Changer l'eau des fleurs", author: 'Valérie Perrin', total_pages: 672, cover_url: null, description: 'Violette Toussaint est garde-cimetière dans un petit village de Bourgogne. Entre les visiteurs, les confidences et un secret qui refait surface, un roman lumineux sur le deuil et l\'espoir.' },
];

export function sampleSearch(query: string): GoogleBookResult[] {
  const text = query.toLowerCase();
  return searchPool.filter((book) => {
    let author = '';
    if (book.author !== null) {
      author = book.author.toLowerCase();
    }
    return book.title.toLowerCase().includes(text) || author.includes(text);
  });
}
