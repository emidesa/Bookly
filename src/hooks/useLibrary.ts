import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { ApiError } from '../services/api';
import { addBook, deleteBook, getBooks } from '../services/bookService';
import { Book, GoogleBookResult } from '../types/book';
import { getErrorMessage } from '../utils/getErrorMessage';

interface LibraryActions {
  isInLibrary: (googleId: string) => boolean;
  addingId: string | null; // google_id du livre en cours d'ajout
  add: (book: GoogleBookResult) => Promise<void>;
  confirmRemove: (book: GoogleBookResult) => void;
}

// PAL de l'utilisateur pour les écrans Recherche et Scanner : savoir si un livre y est, l'ajouter, le retirer
export function useLibrary(): LibraryActions {
  const [books, setBooks] = useState<Book[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const { t } = useLanguage();

  const reload = useCallback(async (): Promise<void> => {
    try {
      setBooks(await getBooks());
    } catch {
      // Sans la PAL, les boutons affichent « Ajouter » ; l'API renverra 409 si besoin
    }
  }, []);

  // Rechargée à chaque affichage de l'écran (un livre a pu être supprimé ailleurs)
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  function isInLibrary(googleId: string): boolean {
    return books.some((book) => book.google_id === googleId);
  }

  async function add(book: GoogleBookResult): Promise<void> {
    setAddingId(book.google_id);
    try {
      const created = await addBook(book);
      setBooks((current) => current.concat([created]));
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // Déjà dans la PAL (ajouté depuis un autre écran) : on met la liste à jour
        await reload();
        return;
      }
      Alert.alert(t('library.addFailedTitle'), getErrorMessage(error, t('library.addFailed')));
    } finally {
      setAddingId(null);
    }
  }

  // Confirmation obligatoire : les sessions du livre sont aussi supprimées (ON DELETE CASCADE)
  function confirmRemove(book: GoogleBookResult): void {
    // L'API supprime par l'id du livre dans la PAL, retrouvé grâce au google_id
    const libraryBook = books.find((item) => item.google_id === book.google_id);
    if (libraryBook === undefined) {
      return;
    }

    Alert.alert(t('library.removeTitle', { title: book.title }), t('library.removeMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('library.remove'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBook(libraryBook.id);
            setBooks((current) => current.filter((item) => item.id !== libraryBook.id));
          } catch (error) {
            Alert.alert(t('library.removeFailedTitle'), getErrorMessage(error, t('library.removeFailed')));
          }
        },
      },
    ]);
  }

  return { isInLibrary, addingId, add, confirmRemove };
}
