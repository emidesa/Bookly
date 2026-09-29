import { useState, type JSX } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BookCard from '../../components/BookCard';
import FilterChip from '../../components/FilterChip';
import { sampleBooks } from '../../data/sampleBooks';
import { sampleUser } from '../../data/sampleUser';
import { serifFont } from '../../theme/fonts';
import { useThemeColors } from '../../theme/useThemeColors';
import { Book, BookStatus } from '../../types/book';
import { showOptionsMenu } from '../../utils/showOptionsMenu';

type StatusFilter = BookStatus | 'all';
type SortOption = 'recent' | 'title' | 'author';

const statusFilters: StatusFilter[] = ['all', 'to_read', 'reading', 'read'];
const sortOptions: SortOption[] = ['recent', 'title', 'author'];

// Libellés des filtres (au pluriel : « Lus »)
const filterLabels: Record<StatusFilter, string> = {
  all: 'Tous',
  to_read: 'À lire',
  reading: 'En cours',
  read: 'Lus',
};

const sortLabels: Record<SortOption, string> = {
  recent: 'Récents',
  title: 'Titre',
  author: 'Auteur',
};

// Filtre par statut puis trie la PAL (fait dans l'appli, sans appel à l'API)
function getVisibleBooks(books: Book[], filter: StatusFilter, sort: SortOption): Book[] {
  let result = books;

  if (filter !== 'all') {
    result = books.filter((book) => book.status === filter);
  }

  // sort() modifie le tableau : on trie une copie
  const sorted = result.slice();

  if (sort === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title, 'fr'));
  }
  if (sort === 'author') {
    sorted.sort((a, b) => {
      const authorA = a.author === null ? '' : a.author;
      const authorB = b.author === null ? '' : b.author;
      return authorA.localeCompare(authorB, 'fr');
    });
  }
  if (sort === 'recent') {
    sorted.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime());
  }

  return sorted;
}

export default function LibraryScreen(): JSX.Element {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortOption>('recent');

  // PROVISOIRE : sampleBooks sera remplacé par l'appel à GET /api/books
  const books = sampleBooks;
  const visibleBooks = getVisibleBooks(books, filter, sort);

  // PROVISOIRE : prénom de l'utilisateur connecté (AuthContext)
  const firstName = sampleUser.first_name;
  const initial = firstName.charAt(0).toUpperCase();

  // Menu de tri natif (feuille sur iPhone, boîte de dialogue sur Android)
  function openSortMenu(): void {
    const labels = sortOptions.map((option) => sortLabels[option]);
    showOptionsMenu('Trier par', labels, sortOptions.indexOf(sort), (index) => {
      setSort(sortOptions[index]);
    });
  }

  const header = (
    <View>
      <View style={styles.topRow}>
        <View style={styles.titles}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>{'Bonjour, ' + firstName}</Text>
          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
            Ma pile à lire
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/reader/profile')}
          accessibilityRole="button"
          accessibilityLabel="Mon profil"
          style={[styles.avatar, { backgroundColor: colors.primarySoft, borderColor: colors.surface }]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>{initial}</Text>
        </Pressable>
      </View>

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
                label={filterLabels[item]}
                count={count}
                selected={isSelected}
                onPress={() => setFilter(item)}
                accessibilityLabel={'Afficher : ' + filterLabels[item]}
              />
            );
          })}
        </ScrollView>

        <Pressable
          onPress={openSortMenu}
          accessibilityRole="button"
          accessibilityLabel={'Trier la liste, tri actuel : ' + sortLabels[sort]}
          style={[styles.sortButton, { backgroundColor: colors.surface, borderColor: colors.separator }]}
        >
          <SymbolView name={{ ios: 'line.3.horizontal.decrease', android: 'filter_list' }} size={22} tintColor={colors.primary} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={visibleBooks}
        keyExtractor={(book) => String(book.id)}
        ListHeaderComponent={header}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 }]}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textSecondary }]}>Aucun livre dans cette catégorie</Text>
        }
        renderItem={({ item }) => (
          <BookCard
            title={item.title}
            author={item.author}
            coverUrl={item.cover_url}
            status={item.status}
            pagesRead={item.pages_read}
            totalPages={item.total_pages}
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  titles: {
    flex: 1,
  },
  greeting: {
    fontSize: 17,
    fontWeight: '500',
  },
  title: {
    fontFamily: serifFont,
    fontSize: 34,
    fontWeight: '700',
    marginTop: 4,
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
  empty: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 32,
  },
});
