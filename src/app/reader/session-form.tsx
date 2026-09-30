import { useCallback, useState, type JSX } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BookCover from '../../components/BookCover';
import DateField from '../../components/DateField';
import EmptyState from '../../components/EmptyState';
import FormError from '../../components/FormError';
import FormField from '../../components/FormField';
import PrimaryButton from '../../components/PrimaryButton';
import { getBook } from '../../services/bookService';
import { createSession, deleteSession, getSession, updateSession } from '../../services/sessionService';
import { serifFont } from '../../theme/fonts';
import { useThemeColors } from '../../theme/useThemeColors';
import type { Book } from '../../types/book';
import { getErrorMessage } from '../../utils/getErrorMessage';

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

// bookId : toujours fourni ; sessionId : seulement pour modifier une session existante
export default function SessionFormScreen(): JSX.Element {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { bookId: bookIdParam, sessionId: sessionIdParam } = useLocalSearchParams<{ bookId: string; sessionId?: string }>();
  const bookId = Number(bookIdParam);
  const sessionId = sessionIdParam === undefined ? null : Number(sessionIdParam);
  const isEditing = sessionId !== null;

  // Clé de ce qui est affiché : évite de montrer un instant l'ancien livre ou l'ancienne session
  const formKey = bookId + '-' + (sessionId ?? 'new');

  const [book, setBook] = useState<Book | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [date, setDate] = useState(new Date());
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [duration, setDuration] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Retour explicite vers la fiche du livre (dans des onglets, « retour » irait à la PAL)
  const goToBook = useCallback((): void => {
    router.navigate({ pathname: '/reader/book/[id]', params: { id: String(bookId) } });
  }, [bookId]);

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
          if (isActive) setLoadError(getErrorMessage(caught, 'Impossible de charger la session.'));
        });

      // Bouton retour d'Android : même destination que la flèche
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        goToBook();
        return true;
      });

      return () => {
        isActive = false;
        subscription.remove();
      };
    }, [bookId, sessionId, formKey, goToBook]),
  );

  async function handleSubmit(): Promise<void> {
    if (book === null) return;

    // Vérifications rapides ; le serveur refait toutes les vérifications
    if (!DIGITS_REGEX.test(startPage) || !DIGITS_REGEX.test(endPage)) {
      setError('Indique la page de début et la page de fin.');
      return;
    }
    const start = Number(startPage);
    const end = Number(endPage);
    if (end < start) {
      setError('La page de fin doit être supérieure ou égale à la page de début.');
      return;
    }
    if (book.total_pages && end > book.total_pages) {
      setError('Le livre ne compte que ' + book.total_pages + ' pages.');
      return;
    }
    if (duration !== '' && (!DIGITS_REGEX.test(duration) || Number(duration) === 0)) {
      setError('La durée doit être un nombre de minutes.');
      return;
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
        Alert.alert('Bravo !', 'Tu as terminé « ' + book.title + ' ». Il rejoint tes livres lus.', [
          { text: 'OK', onPress: goToBook },
        ]);
        return;
      }
      goToBook();
    } catch (caught) {
      setError(getErrorMessage(caught, "Impossible d'enregistrer la session."));
    } finally {
      setIsSaving(false);
    }
  }

  function confirmDelete(): void {
    if (sessionId === null) return;
    Alert.alert('Supprimer cette session ?', 'Le statut du livre ne changera pas.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          setIsDeleting(true);
          deleteSession(sessionId)
            .then(goToBook)
            .catch((caught: unknown) => setError(getErrorMessage(caught, 'Impossible de supprimer la session.')))
            .finally(() => setIsDeleting(false));
        },
      },
    ]);
  }

  // Affiché seulement quand ce qui est chargé correspond à ce qui est demandé
  if (book === null || loadedKey !== formKey) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        {loadError !== null ? (
          <EmptyState message={loadError} isError={true} buttonLabel="Retour" onPress={goToBook} />
        ) : (
          <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Chargement" />
        )}
      </View>
    );
  }

  let progressText = 'Pas encore commencé';
  if (book.current_page > 0) {
    progressText = 'Progression actuelle : page ' + book.current_page;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.header}>
          <Pressable
            onPress={goToBook}
            accessibilityRole="button"
            accessibilityLabel="Retour au livre"
            hitSlop={12}
            style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.separator }]}
          >
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back' }} size={20} tintColor={colors.primary} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
            {isEditing ? 'Modifier la session' : 'Nouvelle session'}
          </Text>
        </View>

        {/* Livre concerné, lu comme un seul élément */}
        <View
          accessible
          accessibilityLabel={book.title + ', ' + progressText}
          style={[styles.bookCard, { backgroundColor: colors.surface, borderColor: colors.separator }]}
        >
          <BookCover title={book.title} author={book.author} coverUrl={book.cover_url} width={56} />
          <View style={styles.bookTexts}>
            <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={[styles.bookProgress, { color: colors.textSecondary }]}>{progressText}</Text>
          </View>
        </View>

        <DateField label="Date" value={date} onChange={setDate} maximumDate={new Date()} />

        <View style={styles.pagesRow}>
          <View style={styles.pageField}>
            <FormField
              label="Page de début"
              value={startPage}
              onChangeText={setStartPage}
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
          <View style={styles.pageField}>
            <FormField
              label="Page de fin"
              value={endPage}
              onChangeText={setEndPage}
              keyboardType="number-pad"
              maxLength={5}
              placeholder={book.total_pages ? 'sur ' + book.total_pages : undefined}
            />
          </View>
        </View>

        <FormField
          label="Durée (minutes)"
          icon={{ ios: 'clock', android: 'schedule' }}
          value={duration}
          onChangeText={setDuration}
          keyboardType="number-pad"
          maxLength={4}
          placeholder="40"
        />

        <FormField
          label="Commentaire (facultatif)"
          value={comment}
          onChangeText={setComment}
          multiline
          maxLength={1000}
          placeholder="Une lecture douce, parfaite pour ce dimanche…"
        />

        <FormError message={error} />

        <View style={styles.actions}>
          <PrimaryButton
            label={isEditing ? 'Enregistrer les modifications' : 'Enregistrer la session'}
            onPress={() => void handleSubmit()}
            isLoading={isSaving}
          />
          <Pressable
            onPress={goToBook}
            accessibilityRole="button"
            accessibilityLabel="Annuler"
            style={({ pressed }) => [
              styles.cancelButton,
              { backgroundColor: colors.surface, borderColor: colors.separator, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.cancelText, { color: colors.primary }]}>Annuler</Text>
          </Pressable>

          {/* Suppression : seulement pour une session existante */}
          {isEditing ? (
            <Pressable
              onPress={confirmDelete}
              disabled={isDeleting}
              accessibilityRole="button"
              accessibilityLabel="Supprimer la session"
              accessibilityState={{ disabled: isDeleting, busy: isDeleting }}
              style={({ pressed }) => [
                styles.cancelButton,
                styles.deleteButton,
                { backgroundColor: colors.errorSoft, borderColor: colors.error, opacity: pressed || isDeleting ? 0.7 : 1 },
              ]}
            >
              <SymbolView name={{ ios: 'trash', android: 'delete' }} size={18} tintColor={colors.error} />
              <Text style={[styles.cancelText, { color: colors.error }]}>Supprimer la session</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: serifFont,
    fontSize: 28,
    fontWeight: '700',
  },
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginBottom: 24,
  },
  bookTexts: {
    flex: 1,
  },
  bookTitle: {
    fontFamily: serifFont,
    fontSize: 17,
    fontWeight: '700',
  },
  bookProgress: {
    fontSize: 14,
    marginTop: 6,
  },
  pagesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pageField: {
    flex: 1,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
});
