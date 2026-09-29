import { useState, type JSX } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BookCover from '../../../components/BookCover';
import ProgressBar from '../../../components/ProgressBar';
import SessionCard from '../../../components/SessionCard';
import { sampleBooks } from '../../../data/sampleBooks';
import { sampleSessions } from '../../../data/sampleSessions';
import { serifFont } from '../../../theme/fonts';
import { useThemeColors } from '../../../theme/useThemeColors';
import { BookStatus, statusLabels } from '../../../types/book';
import { getProgressPercent } from '../../../utils/getProgressPercent';
import { showOptionsMenu } from '../../../utils/showOptionsMenu';

const statusList: BookStatus[] = ['to_read', 'reading', 'read'];

// Statut modifié, mémorisé avec l'id du livre (l'écran est réutilisé d'un livre à l'autre)
interface ChangedStatus {
  bookId: number;
  status: BookStatus;
}

export default function BookDetailScreen(): JSX.Element {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [changedStatus, setChangedStatus] = useState<ChangedStatus | null>(null);

  // PROVISOIRE : sera remplacé par l'appel à GET /api/books/:id
  const book = sampleBooks.find((item) => item.id === Number(id));

  if (book === undefined) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.text }]}>Livre introuvable</Text>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Retour à ma PAL">
          <Text style={[styles.notFoundLink, { color: colors.primary }]}>Retour à ma PAL</Text>
        </Pressable>
      </View>
    );
  }

  let status = book.status;
  if (changedStatus !== null && changedStatus.bookId === book.id) {
    status = changedStatus.status;
  }

  const percent = getProgressPercent(status, book.pages_read, book.total_pages);

  // Page actuelle et pages restantes (livre lu = dernière page)
  let currentPage = 0;
  if (book.pages_read !== null) {
    currentPage = book.pages_read;
  }
  if (status === 'read' && book.total_pages !== null) {
    currentPage = book.total_pages;
  }
  let remainingPages = 0;
  if (book.total_pages !== null) {
    remainingPages = book.total_pages - currentPage;
    if (remainingPages < 0) {
      remainingPages = 0;
    }
  }

  // PROVISOIRE : sera remplacé par l'appel à l'API des sessions (Personne B)
  const sessions = sampleSessions
    .filter((session) => session.book_id === book.id)
    .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());

  let sessionCountText = sessions.length + ' sessions';
  if (sessions.length <= 1) {
    sessionCountText = sessions.length + ' session';
  }

  function openStatusMenu(): void {
    const labels = statusList.map((item) => statusLabels[item]);
    showOptionsMenu('Statut du livre', labels, statusList.indexOf(status), (index) => {
      if (book === undefined) {
        return;
      }
      // PROVISOIRE : PUT /api/books/:id quand l'API sera branchée
      setChangedStatus({ bookId: book.id, status: statusList[index] });
    });
  }

  function confirmDelete(): void {
    Alert.alert('Retirer ce livre de ta PAL ?', 'Ses sessions de lecture seront aussi supprimées.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        // PROVISOIRE : DELETE /api/books/:id quand l'API sera branchée
        onPress: () => router.back(),
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
        {percent !== null && book.total_pages !== null && (
          <View
            style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.separator }]}
            accessible={true}
            accessibilityLabel={'Ma progression : ' + percent + ' %, page ' + currentPage + ' sur ' + book.total_pages + ', ' + remainingPages + ' pages restantes'}
          >
            <View style={styles.progressTop}>
              <Text style={[styles.progressLabel, { color: colors.text }]}>Ma progression</Text>
              <Text style={[styles.progressPercent, { color: colors.primary }]}>{percent + ' %'}</Text>
            </View>
            <ProgressBar percent={percent} showPercent={false} />
            <View style={styles.progressBottom}>
              <Text style={[styles.progressDetail, { color: colors.textSecondary }]}>
                {'Page ' + currentPage + ' sur ' + book.total_pages}
              </Text>
              <Text style={[styles.progressDetail, { color: colors.textSecondary }]}>{remainingPages + ' pages restantes'}</Text>
            </View>
          </View>
        )}

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
          <SessionCard key={session.id} session={session} />
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
  progressCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 28,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 17,
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '700',
  },
  progressBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  progressDetail: {
    fontSize: 14,
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
  },
  notFoundText: {
    fontSize: 17,
    marginBottom: 12,
  },
  notFoundLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});
