import { Request, Response } from 'express';
import { findBookByIsbn, searchBooks } from '../services/googleBooks';

// GET /api/google/search?q=...
export async function search(req: Request, res: Response): Promise<void> {
  const query = req.query.q;
  if (typeof query !== 'string' || query.trim() === '') {
    res.status(400).json({ message: 'Saisis un titre ou un auteur pour lancer la recherche' });
    return;
  }

  try {
    const books = await searchBooks(query.trim());
    res.status(200).json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'La recherche est indisponible, réessaie plus tard' });
  }
}

// GET /api/google/isbn/:isbn
export async function findByIsbn(req: Request<{ isbn: string }>, res: Response): Promise<void> {
  const isbn = req.params.isbn.replace(/-/g, '');
  if (isbn.length !== 10 && isbn.length !== 13) {
    res.status(400).json({ message: "Ce code-barres n'est pas un ISBN valide" });
    return;
  }

  try {
    const book = await findBookByIsbn(isbn);
    if (!book) {
      res.status(404).json({ message: 'Aucun livre trouvé pour ce code-barres' });
      return;
    }
    res.status(200).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'La recherche est indisponible, réessaie plus tard' });
  }
}
