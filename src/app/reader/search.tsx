import { useEffect, useState, type JSX } from 'react';
import { ActivityIndicator, Alert, FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BookPreviewModal from '../../components/BookPreviewModal';
import SearchBookCard from '../../components/SearchBookCard';
import { sampleBooks } from '../../data/sampleBooks';
import { sampleSearch, sampleTrending } from '../../data/sampleGoogleBooks';
import { serifFont } from '../../theme/fonts';
import { useThemeColors } from '../../theme/useThemeColors';
import { GoogleBookResult } from '../../types/book';

const MIN_LETTERS = 2; // en dessous, on affiche les recommandations
const SEARCH_DELAY = 400; // ms après la dernière lettre tapée

export default function SearchScreen(): JSX.Element {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState<string | null>(null); // null = recommandations
  const [results, setResults] = useState<GoogleBookResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [previewBook, setPreviewBook] = useState<GoogleBookResult | null>(null); // livre affiché dans le résumé
  // PROVISOIRE : google_id des livres de la PAL (sera chargé par GET /api/books)
  const [libraryIds, setLibraryIds] = useState<string[]>(sampleBooks.map((book) => book.google_id));

  // Recherche pendant la frappe, 400 ms après la dernière lettre (« debounce ») :
  // une seule requête quand l'utilisateur fait une pause, pour ménager le quota Google
  useEffect(() => {
    const text = query.trim();

    // Moins de 2 lettres : pas de recherche (l'écran affiche les recommandations)
    if (text.length < MIN_LETTERS) {
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(true);
      setErrorMessage(null);
      // PROVISOIRE : sera remplacé par GET /api/google/search?q=...
      setResults(sampleSearch(text));
      setSearchedQuery(text);
      setIsLoading(false);
    }, SEARCH_DELAY);

    // Une nouvelle lettre annule la recherche prévue
    return () => clearTimeout(timer);
  }, [query]);

  function clearSearch(): void {
    setQuery('');
  }

  function addToLibrary(book: GoogleBookResult): void {
    setAddingId(book.google_id);
    // PROVISOIRE : POST /api/books ; en cas de 409, afficher « Ce livre est déjà dans ta PAL »
    setLibraryIds(libraryIds.concat([book.google_id]));
    setAddingId(null);
  }

  // Confirmation obligatoire : les sessions du livre sont aussi supprimées (ON DELETE CASCADE)
  function removeFromLibrary(book: GoogleBookResult): void {
    Alert.alert('Retirer « ' + book.title + ' » de ta PAL ?', 'Ses sessions de lecture seront aussi supprimées.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: () => {
          // PROVISOIRE : DELETE /api/books/:id (id retrouvé dans la PAL grâce au google_id)
          setLibraryIds(libraryIds.filter((id) => id !== book.google_id));
        },
      },
    ]);
  }

  // Résultats seulement si au moins 2 lettres ET une recherche déjà faite
  const isShowingResults = query.trim().length >= MIN_LETTERS && searchedQuery !== null;
  let books: GoogleBookResult[] = sampleTrending;
  if (isShowingResults) {
    books = results;
  }

  const header = (
    <View>
      <Text style={[styles.overline, { color: colors.textSecondary }]}>Explorer</Text>
      <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
        Trouver un livre
      </Text>

      {/* Champ de recherche : contour visible (WCAG 1.4.11, un champ vide n'a pas de texte) */}
      <View style={[styles.searchField, { backgroundColor: colors.surface, borderColor: colors.inputBorder }]}>
        <SymbolView name={{ ios: 'magnifyingglass', android: 'search' }} size={22} tintColor={colors.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => Keyboard.dismiss()}
          placeholder="Rechercher un titre, un auteur..."
          placeholderTextColor={colors.textSecondary}
          returnKeyType="search"
          accessibilityLabel="Rechercher un livre par titre ou par auteur"
          style={[styles.input, { color: colors.text }]}
        />
        {query !== '' && (
          <Pressable onPress={clearSearch} accessibilityRole="button" accessibilityLabel="Effacer la recherche" hitSlop={12}>
            <SymbolView name={{ ios: 'xmark.circle.fill', android: 'cancel' }} size={20} tintColor={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {!isShowingResults && (
        <View style={[styles.banner, { backgroundColor: colors.primarySoft }]}>
          <SymbolView name={{ ios: 'chart.bar', android: 'bar_chart' }} size={20} tintColor={colors.primary} />
          <Text style={[styles.bannerText, { color: colors.primary }]}>Inspiré des livres les plus ajoutés par la communauté</Text>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]} accessibilityRole="header">
          {isShowingResults ? 'Résultats' : 'Recommandations'}
        </Text>
      </View>

      {isLoading && (
        <View style={styles.message} accessible={true} accessibilityLabel="Recherche en cours">
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.messageText, { color: colors.textSecondary }]}>Recherche en cours...</Text>
        </View>
      )}
      {isShowingResults && errorMessage !== null && (
        <Text style={[styles.messageText, { color: colors.error }]} accessibilityRole="alert">
          {errorMessage}
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={books}
        keyExtractor={(book) => book.google_id}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 }]}
        ListEmptyComponent={
          isShowingResults && !isLoading ? (
            <Text style={[styles.messageText, { color: colors.textSecondary }]}>
              {'Aucun livre trouvé pour « ' + searchedQuery + ' »'}
            </Text>
          ) : null
        }
        renderItem={({ item, index }) => (
          <SearchBookCard
            book={item}
            rank={isShowingResults ? undefined : index + 1}
            inLibrary={libraryIds.includes(item.google_id)}
            isAdding={addingId === item.google_id}
            onAdd={() => addToLibrary(item)}
            onRemove={() => removeFromLibrary(item)}
            onOpen={() => setPreviewBook(item)}
          />
        )}
      />

      {/* Résumé du livre choisi (même liste PAL que les cartes) */}
      <BookPreviewModal
        book={previewBook}
        inLibrary={previewBook !== null && libraryIds.includes(previewBook.google_id)}
        isAdding={previewBook !== null && addingId === previewBook.google_id}
        onAdd={() => {
          if (previewBook !== null) {
            addToLibrary(previewBook);
          }
        }}
        onRemove={() => {
          if (previewBook !== null) {
            removeFromLibrary(previewBook);
          }
        }}
        onClose={() => setPreviewBook(null)}
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
  overline: {
    fontSize: 17,
    fontWeight: '500',
  },
  title: {
    fontFamily: serifFont,
    fontSize: 34,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 24,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 17,
    marginLeft: 12,
    paddingVertical: 12,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: serifFont,
    fontSize: 24,
    fontWeight: '700',
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  messageText: {
    fontSize: 15,
    marginLeft: 8,
    marginBottom: 16,
  },
});
