import { useCallback, useState, type JSX } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BookCard from '../../components/BookCard';
import EmptyState from '../../components/EmptyState';
import FilterChip from '../../components/FilterChip';
import ScreenHeader from '../../components/ScreenHeader';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getBooks } from '../../services/bookService';
import { useThemeColors } from '../../theme/useThemeColors';
import { Book } from '../../types/book';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { showOptionsMenu } from '../../utils/showOptionsMenu';
import {
  filterKeys,
  getVisibleBooks,
  sortKeys,
  sortOptions,
  statusFilters,
  type SortOption,
  type StatusFilter,
} from '../../utils/sortBooks';

export default function LibraryScreen(): JSX.Element {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortOption>('recent');

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true); // premier chargement
  const [isRefreshing, setIsRefreshing] = useState(false); // tirer vers le bas
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // GET /api/books
  const loadBooks = useCallback(async (): Promise<void> => {
    try {
      setBooks(await getBooks());
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t('library.loadError')));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Rechargée à chaque retour sur l'onglet (livre ajouté depuis la recherche, statut modifié...)
  useFocusEffect(
    useCallback(() => {
      void loadBooks();
    }, [loadBooks]),
  );

  async function refresh(): Promise<void> {
    setIsRefreshing(true);
    await loadBooks();
    setIsRefreshing(false);
  }

  function retry(): void {
    setIsLoading(true);
    void loadBooks();
  }

  const visibleBooks = getVisibleBooks(books, filter, sort);

  // Prénom de l'utilisateur connecté
  let greeting = t('library.greeting');
  let initial = '?';
  if (user !== null && user.first_name !== '') {
    greeting = t('library.greetingName', { name: user.first_name });
    initial = user.first_name.charAt(0).toUpperCase();
  }

  // Menu de tri natif (feuille sur iPhone, boîte de dialogue sur Android)
  function openSortMenu(): void {
    const labels = sortOptions.map((option) => t(sortKeys[option]));
    showOptionsMenu(t('library.sortBy'), labels, sortOptions.indexOf(sort), (index) => {
      setSort(sortOptions[index]);
    });
  }

  const header = (
    <View>
      <ScreenHeader
        overline={greeting}
        title={t('library.title')}
        right={
          <Pressable
            onPress={() => router.push('/reader/profile')}
            accessibilityRole="button"
            accessibilityLabel={t('library.myProfile')}
            style={[styles.avatar, { backgroundColor: colors.primarySoft, borderColor: colors.surface }]}
          >
            <Text style={[styles.avatarText, { color: colors.primary }]}>{initial}</Text>
          </Pressable>
        }
      />

      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {statusFilters.map((item) => {
            const isSelected = filter === item;
            let count: number | undefined = undefined;
            if (isSelected) {
              count = visibleBooks.length;
            }
            return (
              <FilterChip
                key={item}
                label={t(filterKeys[item])}
                count={count}
                selected={isSelected}
                onPress={() => setFilter(item)}
                accessibilityLabel={t('library.showFilter', { filter: t(filterKeys[item]) })}
              />
            );
          })}
        </ScrollView>

        <Pressable
          onPress={openSortMenu}
          accessibilityRole="button"
          accessibilityLabel={t('library.sortButton', { sort: t(sortKeys[sort]) })}
          style={[styles.sortButton, { backgroundColor: colors.surface, borderColor: colors.separator }]}
        >
          <SymbolView name={{ ios: 'line.3.horizontal.decrease', android: 'filter_list' }} size={22} tintColor={colors.primary} />
        </Pressable>
      </View>
    </View>
  );

  // Liste vide : chargement, erreur, PAL vide ou filtre sans résultat
  let emptyContent: JSX.Element;
  if (isLoading) {
    emptyContent = <ActivityIndicator style={styles.loader} color={colors.primary} accessibilityLabel={t('library.loading')} />;
  } else if (errorMessage !== null) {
    emptyContent = <EmptyState message={errorMessage} isError={true} buttonLabel={t('common.retry')} onPress={retry} />;
  } else if (books.length === 0) {
    emptyContent = (
      <EmptyState
        message={t('library.empty')}
        buttonLabel={t('library.findBook')}
        onPress={() => router.push('/reader/search')}
      />
    );
  } else {
    emptyContent = <EmptyState message={t('library.emptyFilter')} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={visibleBooks}
        keyExtractor={(book) => String(book.id)}
        ListHeaderComponent={header}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 }]}
        ListEmptyComponent={emptyContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} colors={[colors.primary]} />
        }
        renderItem={({ item }) => (
          <BookCard
            title={item.title}
            author={item.author}
            coverUrl={item.cover_url}
            status={item.status}
            progressPercent={item.progress_percent}
            onPress={() => router.push({ pathname: '/reader/book/[id]', params: { id: String(item.id) } })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  chips: {
    flex: 1,
  },
  sortButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  loader: {
    marginTop: 32,
  },
});
