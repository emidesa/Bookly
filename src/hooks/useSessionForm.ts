import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import { useFocusEffect } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { getBook } from '../services/bookService';
import { createSession, deleteSession, getSession, updateSession } from '../services/sessionService';
import type { Book } from '../types/book';
import { getErrorMessage } from '../utils/getErrorMessage';

const DIGITS_REGEX = /^\d+$/;

// Date au format de l'API (AAAA-MM-JJ) en heure locale : toISOString() passerait en UTC
function toApiDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + month + '-' + day;
}

// Inverse de toApiDate : 'AAAA-MM-JJ' → date locale (new Date('AAAA-MM-JJ') serait en UTC)
function fromApiDate(text: string): Date {
  const [year, month, day] = text.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// saved : enregistrée ; finished : dernière page atteinte (livre passé en « lu ») ; error : message dans error
export type SubmitResult = 'saved' | 'finished' | 'error';

interface SessionForm {
  book: Book | null; // null tant que le formulaire demandé n'est pas chargé
  loadError: string | null;
  isEditing: boolean;
  date: Date;
  setDate: Dispatch<SetStateAction<Date>>;
  startPage: string;
  setStartPage: Dispatch<SetStateAction<string>>;
  endPage: string;
  setEndPage: Dispatch<SetStateAction<string>>;
  duration: string;
  setDuration: Dispatch<SetStateAction<string>>;
  comment: string;
  setComment: Dispatch<SetStateAction<string>>;
  error: string | null;
  isSaving: boolean;
  isDeleting: boolean;
  submit: () => Promise<SubmitResult>;
  remove: () => Promise<boolean>;
}

// Logique du formulaire de session (création si sessionId est null, sinon modification)
// L'écran garde l'affichage, les alertes et la navigation
export function useSessionForm(bookId: number, sessionId: number | null): SessionForm {
  const { t } = useLanguage();

  // Clé de ce qui est affiché : évite de montrer un instant l'ancien livre ou l'ancienne session
  const formKey = bookId + '-' + (sessionId ?? 'new');

  const [book, setBook] = useState<Book | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [date, setDate] = useState(new Date());
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [duration, setDuration] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // À chaque affichage : l'écran reste en mémoire dans les onglets, on repart d'un formulaire neuf
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      Promise.all([getBook(bookId), sessionId === null ? null : getSession(sessionId)])
        .then(([loadedBook, session]) => {
          if (!isActive) return;
          setBook(loadedBook);
          setLoadError(null);
          setError(null);
          if (session !== null) {
            // Modification : champs pré-remplis avec la session
            setDate(fromApiDate(session.session_date));
            setStartPage(String(session.start_page));
            setEndPage(String(session.end_page));
            setDuration(session.duration_minutes === null ? '' : String(session.duration_minutes));
            setComment(session.comment ?? '');
          } else {
            // Création : on reprend là où la lecture s'est arrêtée (calculé par le serveur)
            setDate(new Date());
            setStartPage(String(loadedBook.current_page));
            setEndPage('');
            setDuration('');
            setComment('');
          }
          setLoadedKey(formKey);
        })
        .catch((caught: unknown) => {
          if (isActive) setLoadError(getErrorMessage(caught, t('sessionForm.loadError')));
        });

      return () => {
        isActive = false;
      };
    }, [bookId, sessionId, formKey, t]),
  );

  async function submit(): Promise<SubmitResult> {
    if (book === null) return 'error';

    // Vérifications rapides ; le serveur refait toutes les vérifications
    if (!DIGITS_REGEX.test(startPage) || !DIGITS_REGEX.test(endPage)) {
      setError(t('sessionForm.missingPages'));
      return 'error';
    }
    const start = Number(startPage);
    const end = Number(endPage);
    if (end < start) {
      setError(t('sessionForm.endBeforeStart'));
      return 'error';
    }
    if (book.total_pages && end > book.total_pages) {
      setError(t('sessionForm.tooManyPages', { count: book.total_pages }));
      return 'error';
    }
    if (duration !== '' && (!DIGITS_REGEX.test(duration) || Number(duration) === 0)) {
      setError(t('sessionForm.invalidDuration'));
      return 'error';
    }

    setError(null);
    setIsSaving(true);
    try {
      const data = {
        session_date: toApiDate(date),
        start_page: start,
        end_page: end,
        duration_minutes: duration === '' ? null : Number(duration),
        comment: comment.trim() === '' ? null : comment.trim(),
      };
      if (sessionId !== null) {
        await updateSession(sessionId, data);
      } else {
        await createSession({ book_id: book.id, ...data });
      }

      // Dernière page atteinte : le serveur a passé le livre en « lu »
      if (book.total_pages && end >= book.total_pages && book.status !== 'read') {
        return 'finished';
      }
      return 'saved';
    } catch (caught) {
      setError(getErrorMessage(caught, t('sessionForm.saveFailed')));
      return 'error';
    } finally {
      setIsSaving(false);
    }
  }

  // Renvoie true si la session a été supprimée
  async function remove(): Promise<boolean> {
    if (sessionId === null) return false;
    setIsDeleting(true);
    try {
      await deleteSession(sessionId);
      return true;
    } catch (caught) {
      setError(getErrorMessage(caught, t('sessionForm.deleteFailed')));
      return false;
    } finally {
      setIsDeleting(false);
    }
  }

  return {
    book: loadedKey === formKey ? book : null,
    loadError,
    isEditing: sessionId !== null,
    date,
    setDate,
    startPage,
    setStartPage,
    endPage,
    setEndPage,
    duration,
    setDuration,
    comment,
    setComment,
    error,
    isSaving,
    isDeleting,
    submit,
    remove,
  };
}
