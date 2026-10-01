import { useCallback, useEffect, useState, type JSX } from 'react';
import { ActivityIndicator, FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BookPreviewModal from '../../components/BookPreviewModal';
import ScreenHeader from '../../components/ScreenHeader';
import SearchBookCard from '../../components/SearchBookCard';
import { useLanguage } from '../../context/LanguageContext';
import { useLibrary } from '../../hooks/useLibrary';
import { getTrending, searchGoogle } from '../../services/bookService';
import { serifFont } from '../../theme/fonts';
import { useThemeColors } from '../../theme/useThemeColors';
import { GoogleBookResult, TrendingBook } from '../../types/book';
import { getErrorMessage } from '../../utils/getErrorMessage';

const MIN_LETTERS = 2; // en dessous, on affiche les recommandations
const SEARCH_DELAY = 400; // ms après la dernière lettre tapée

export default function SearchScreen(): JSX.Element {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState<string | null>(null); // null = recommandations
  const [results, setResults] = useState<GoogleBookResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewBook, setPreviewBook] = useState<GoogleBookResult | null>(null); // livre affiché dans le résumé
  const [trending, setTrending] = useState<TrendingBook[]>([]);
  const library = useLibrary(); // PAL : savoir si un livre y est, l'ajouter, le retirer

  // Tendances (GET /api/books/trending), rechargées à chaque affichage de l'onglet
  useFocusEffect(
    useCallback(() => {
      async function loadTrending(): Promise<void> {
        try {
          setTrending(await getTrending());
        } catch {
          // Pas de tendances : la liste reste vide, la recherche fonctionne quand même
        }
      }
      void loadTrending();
    }, []),
  );

  // Recherche pendant la frappe, 400 ms après la dernière lettre (« debounce ») :
  // une seule requête quand l'utilisateur fait une pause, pour ménager le quota Google
  useEffect(() => {
    const text = query.trim();

    // Moins de 2 lettres : pas de recherche (l'écran affiche les recommandations)
    if (text.length < MIN_LETTERS) {
      return;
    }

    // Réponse périmée : si l'utilisateur a retapé entre-temps, on ignore l'ancienne réponse
    let isOutdated = false;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const books = await searchGoogle(text);
        if (!isOutdated) {
          setResults(books);
          setSearchedQuery(text);
        }
      } catch (error) {
        if (!isOutdated) {
          setResults([]);
          setErrorMessage(getErrorMessage(error, t('search.unavailable')));
          setSearchedQuery(text);
        }
      } finally {
        if (!isOutdated) {
          setIsLoading(false);
        }
      }
    }, SEARCH_DELAY);

    // Une nouvelle lettre annule la recherche prévue et rend la réponse en cours périmée
    return () => {
      clearTimeout(timer);
      isOutdated = true;
    };
  }, [query, t]);

  function clearSearch(): void {
    setQuery('');
  }

  // Résultats seulement si au moins 2 lettres ET une recherche déjà faite
  const isShowingResults = query.trim().length >= MIN_LETTERS && searchedQuery !== null;
  let books: GoogleBookResult[] = trending;
  if (isShowingResults) {
    books = results;
  }

  const header = (
    <View>
      <ScreenHeader overline={t('search.overline')} title={t('search.title')} />

      {/* Champ de recherche : contour visible (WCAG 1.4.11, un champ vide n'a pas de texte) */}
      <View style={[styles.searchField, { backgroundColor: colors.surface, borderColor: colors.inputBorder }]}>
        <SymbolView name={{ ios: 'magnifyingglass', android: 'search' }} size={22} tintColor={colors.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => Keyboard.dismiss()}
          placeholder={t('search.placeholder')}
          placeholderTextColor={colors.textSecondary}
          returnKeyType="search"
          accessibilityLabel={t('search.inputLabel')}
          style={[styles.input, { color: colors.text }]}
        />
        {query !== '' && (
          <Pressable onPress={clearSearch} accessibilityRole="button" accessibilityLabel={t('common.clearSearch')} hitSlop={12}>
            <SymbolView name={{ ios: 'xmark.circle.fill', android: 'cancel' }} size={20} tintColor={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {!isShowingResults && (
        <View style={[styles.banner, { backgroundColor: colors.primarySoft }]}>
          <SymbolView name={{ ios: 'chart.bar', android: 'bar_chart' }} size={20} tintColor={colors.primary} />
          <Text style={[styles.bannerText, { color: colors.primary }]}>{t('search.banner')}</Text>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]} accessibilityRole="header">
          {isShowingResults ? t('search.results') : t('search.recommendations')}
        </Text>
      </View>

      {isLoading && (
        <View style={styles.message} accessible={true} accessibilityLabel={t('search.searching')}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.messageText, { color: colors.textSecondary }]}>{t('search.searching') + '...'}</Text>
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
              {t('search.noResult', { query: searchedQuery ?? '' })}
            </Text>
          ) : null
        }
        renderItem={({ item, index }) => (
          <SearchBookCard
            book={item}
            rank={isShowingResults ? undefined : index + 1}
            inLibrary={library.isInLibrary(item.google_id)}
            isAdding={library.addingId === item.google_id}
            onAdd={() => void library.add(item)}
            onRemove={() => library.confirmRemove(item)}
            onOpen={() => setPreviewBook(item)}
          />
        )}
      />

      {/* Résumé du livre choisi (même liste PAL que les cartes) */}
      <BookPreviewModal
        book={previewBook}
        inLibrary={previewBook !== null && library.isInLibrary(previewBook.google_id)}
        isAdding={previewBook !== null && library.addingId === previewBook.google_id}
        onAdd={() => {
          if (previewBook !== null) {
            void library.add(previewBook);
          }
        }}
        onRemove={() => {
          if (previewBook !== null) {
            library.confirmRemove(previewBook);
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
