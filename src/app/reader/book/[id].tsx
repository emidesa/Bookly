import { useCallback, useState, type JSX } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BookCover from '../../../components/BookCover';
import ProgressCard from '../../../components/ProgressCard';
import EmptyState from '../../../components/EmptyState';
import SessionCard from '../../../components/SessionCard';
import { deleteBook, getBook, updateBookStatus } from '../../../services/bookService';
import { getSessions } from '../../../services/sessionService';
import { serifFont } from '../../../theme/fonts';
import { useThemeColors } from '../../../theme/useThemeColors';
import { Book, BookStatus, statusLabels } from '../../../types/book';
import { ReadingSession } from '../../../types/readingSession';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showOptionsMenu } from '../../../utils/showOptionsMenu';

const statusList: BookStatus[] = ['to_read', 'reading', 'read'];

// Erreur de chargement, mémorisée avec l'id du livre (l'écran est réutilisé d'un livre à l'autre)
interface LoadError {
  bookId: number;
  message: string;
}

export default function BookDetailScreen(): JSX.Element {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Number(id);

  const [book, setBook] = useState<Book | null>(null);
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [loadError, setLoadError] = useState<LoadError | null>(null);

  // Livre + sessions en même temps, à chaque affichage (à jour après une nouvelle session)
  const loadBook = useCallback(async (): Promise<void> => {
    try {
      const [loadedBook, loadedSessions] = await Promise.all([getBook(bookId), getSessions(bookId)]);
      setBook(loadedBook);
      setSessions(loadedSessions);
      setLoadError(null);
    } catch (error) {
      setLoadError({ bookId: bookId, message: getErrorMessage(error, 'Impossible de charger ce livre.') });
    }
  }, [bookId]);

  useFocusEffect(
    useCallback(() => {
      void loadBook();
    }, [loadBook]),
  );

  // Le livre en mémoire est-il celui demandé ? (sinon on verrait l'ancien un instant)
  const hasBook = book !== null && book.id === bookId;
  const hasError = loadError !== null && loadError.bookId === bookId;

  if (!hasBook) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        {hasError ? (
          <EmptyState message={loadError.message} isError={true} buttonLabel="Retour à ma PAL" onPress={() => router.back()} />
        ) : (
          <ActivityIndicator color={colors.primary} accessibilityLabel="Chargement du livre" />
        )}
      </View>
    );
  }

  const status = book.status;

  let sessionCountText = sessions.length + ' sessions';
  if (sessions.length <= 1) {
    sessionCountText = sessions.length + ' session';
  }

  function openStatusMenu(): void {
    const labels = statusList.map((item) => statusLabels[item]);
    showOptionsMenu('Statut du livre', labels, statusList.indexOf(status), async (index) => {
      // PUT /api/books/:id : l'API renvoie le livre à jour
      try {
        setBook(await updateBookStatus(bookId, statusList[index]));
      } catch (error) {
        Alert.alert('Modification impossible', getErrorMessage(error, 'Impossible de modifier le statut.'));
      }
    });
  }

  function confirmDelete(): void {
    Alert.alert('Retirer ce livre de ta PAL ?', 'Ses sessions de lecture seront aussi supprimées.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        // DELETE /api/books/:id puis retour à la PAL
        onPress: async () => {
          try {
            await deleteBook(bookId);
            router.back();
          } catch (error) {
            Alert.alert('Suppression impossible', getErrorMessage(error, 'Impossible de supprimer ce livre.'));
          }
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 100 }]}>
        {/* En-tête : retour, titre, supprimer */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Retour"
            style={[styles.headerButton, { backgroundColor: colors.surface, borderColor: colors.separator }]}
          >
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back' }} size={20} tintColor={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]} accessibilityRole="header">
            Détails du livre
          </Text>
          <Pressable
            onPress={confirmDelete}
            accessibilityRole="button"
            accessibilityLabel="Supprimer ce livre de ma PAL"
            style={[styles.headerButton, { backgroundColor: colors.errorSoft, borderColor: colors.errorSoft }]}
          >
            <SymbolView name={{ ios: 'trash', android: 'delete' }} size={20} tintColor={colors.error} />
          </Pressable>
        </View>

        {/* Couverture et informations */}
        <View style={styles.top}>
          <BookCover title={book.title} author={book.author} coverUrl={book.cover_url} width={130} />
          <View style={styles.info}>
            <Text style={[styles.title, { color: colors.text }]}>{book.title}</Text>
            {book.author !== null && <Text style={[styles.author, { color: colors.textSecondary }]}>{book.author}</Text>}
            {book.total_pages !== null && (
              <View style={styles.pagesRow}>
                <SymbolView name={{ ios: 'doc.text', android: 'description' }} size={20} tintColor={colors.textSecondary} />
                <Text style={[styles.pages, { color: colors.textSecondary }]}>{book.total_pages + ' pages'}</Text>
              </View>
            )}
            <Pressable
              onPress={openStatusMenu}
              accessibilityRole="button"
              accessibilityLabel={'Statut : ' + statusLabels[status] + ', modifier'}
              style={[styles.statusSelect, { backgroundColor: colors.primarySoft }]}
            >
              <Text style={[styles.statusText, { color: colors.primary }]}>{statusLabels[status]}</Text>
              <SymbolView name={{ ios: 'chevron.down', android: 'expand_more' }} size={14} tintColor={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Ma progression */}
        <ProgressCard
          percent={book.progress_percent}
          currentPage={book.current_page}
          totalPages={book.total_pages}
          remainingPages={book.remaining_pages}
        />

        {/* Mes sessions */}
        <View style={styles.sessionsHeader}>
          <Text style={[styles.sessionsTitle, { color: colors.text }]} accessibilityRole="header">
            Mes sessions
          </Text>
          <Text style={[styles.sessionsCount, { color: colors.textSecondary }]}>{sessionCountText}</Text>
        </View>
        {sessions.length === 0 && (
          <Text style={[styles.noSession, { color: colors.textSecondary }]}>Aucune session pour le moment</Text>
        )}
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onPress={() =>
              router.push({
                pathname: '/reader/session-form',
                params: { bookId: String(book.id), sessionId: String(session.id) },
              })
            }
          />
        ))}
      </ScrollView>

      {/* Bouton flottant : formulaire de session (Personne B) */}
      <Pressable
        onPress={() => router.push({ pathname: '/reader/session-form', params: { bookId: String(book.id) } })}
        accessibilityRole="button"
        accessibilityLabel="Ajouter ma progression"
        style={[styles.addButton, { backgroundColor: colors.primary, shadowColor: colors.shadow, bottom: insets.bottom + 16 }]}
      >
        <SymbolView name={{ ios: 'plus', android: 'add' }} size={22} tintColor={colors.onPrimary} />
        <Text style={[styles.addButtonText, { color: colors.onPrimary }]}>Ajouter ma progression</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  top: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  info: {
    flex: 1,
    marginLeft: 20,
    justifyContent: 'center',
  },
  title: {
    fontFamily: serifFont,
    fontSize: 26,
    fontWeight: '700',
  },
  author: {
    fontSize: 17,
    marginTop: 10,
  },
  pagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  pages: {
    fontSize: 15,
    marginLeft: 8,
  },
  statusSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginTop: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
  },
  sessionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionsTitle: {
    fontFamily: serifFont,
    fontSize: 24,
    fontWeight: '700',
  },
  sessionsCount: {
    fontSize: 15,
  },
  noSession: {
    fontSize: 15,
    marginBottom: 12,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 22,
    borderRadius: 28,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
});
