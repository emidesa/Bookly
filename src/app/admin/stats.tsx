import { useCallback, useState, type JSX } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdminMenuButton from '../../components/AdminMenuButton';
import BookCover from '../../components/BookCover';
import EmptyState from '../../components/EmptyState';
import ScreenHeader from '../../components/ScreenHeader';
import StatCard from '../../components/StatCard';
import { useLanguage } from '../../context/LanguageContext';
import { getAdminStats } from '../../services/adminService';
import { getTrending } from '../../services/bookService';
import { serifFont } from '../../theme/fonts';
import { useThemeColors } from '../../theme/useThemeColors';
import type { AdminStats } from '../../types/admin';
import type { TrendingBook } from '../../types/book';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function AdminStatsScreen(): JSX.Element {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [topBooks, setTopBooks] = useState<TrendingBook[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Les deux appels partent en même temps
  const loadStats = useCallback(async (): Promise<void> => {
    try {
      const [loadedStats, trending] = await Promise.all([getAdminStats(), getTrending()]);
      setStats(loadedStats);
      setTopBooks(trending.slice(0, 3));
      setLoadError(null);
    } catch (error) {
      setLoadError(getErrorMessage(error, t('adminStats.loadError')));
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      void loadStats();
    }, [loadStats]),
  );

  async function refresh(): Promise<void> {
    setIsRefreshing(true);
    await loadStats();
    setIsRefreshing(false);
  }

  if (stats === null) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        {loadError !== null ? (
          <EmptyState message={loadError} isError={true} buttonLabel={t('common.retry')} onPress={() => void loadStats()} />
        ) : (
          <ActivityIndicator size="large" color={colors.primary} accessibilityLabel={t('common.loading')} />
        )}
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120 }]}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />}
    >
      <ScreenHeader overline={t('admin.menu')} title={t('adminStats.title')} right={<AdminMenuButton current="stats" />} />

      {/* Lecteurs : sur toute la largeur (seul dans sa ligne) */}
      <View style={styles.row}>
        <StatCard
          value={stats.total_users}
          label={t('adminStats.readers')}
          icon={{ ios: 'person.2', android: 'group' }}
          iconBackground={colors.primarySoft}
          iconColor={colors.primary}
        />
      </View>

      <View style={styles.row}>
        <StatCard
          value={stats.total_books}
          label={t('adminStats.booksAdded')}
          icon={{ ios: 'book', android: 'menu_book' }}
          iconBackground={colors.primarySoft}
          iconColor={colors.primary}
        />
        <StatCard
          value={stats.total_sessions}
          label={t('adminStats.sessions')}
          icon={{ ios: 'clock', android: 'schedule' }}
          iconBackground={colors.accentSoft}
          iconColor={colors.accentText}
        />
      </View>

      {/* Top 3 : route « tendances » de la PAL (Personne A) */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]} accessibilityRole="header">
          {t('adminStats.mostAdded')}
        </Text>
        <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>{t('adminStats.sinceStart')}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
        {topBooks.length === 0 ? (
          <Text style={[styles.noBook, { color: colors.textSecondary }]}>{t('adminStats.noBook')}</Text>
        ) : (
          topBooks.map((book, index) => {
            const isFirst = index === 0;
            const addsText = t('adminStats.adds', { count: book.readers });
            return (
              <View
                key={book.google_id}
                accessible
                accessibilityLabel={t('adminStats.rankLabel', { rank: index + 1, title: book.title }) + (book.author ? ', ' + t('common.by', { author: book.author }) : '') + ', ' + addsText}
                style={[styles.bookRow, index > 0 && { borderTopWidth: 1, borderTopColor: colors.separator }]}
              >
                <Text style={[styles.rank, { color: colors.textSecondary }]}>{index + 1}</Text>
                <BookCover title={book.title} author={book.author} coverUrl={book.cover_url} width={44} />
                <View style={styles.bookTexts}>
                  <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
                    {book.title}
                  </Text>
                  {book.author ? (
                    <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                      {book.author}
                    </Text>
                  ) : null}
                </View>
                <View style={[styles.addsBadge, { backgroundColor: isFirst ? colors.accentSoft : colors.surfaceElevated }]}>
                  <Text style={[styles.addsText, { color: isFirst ? colors.accentText : colors.textSecondary }]}>{addsText}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    gap: 14,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  sectionTitle: {
    fontFamily: serifFont,
    fontSize: 22,
    fontWeight: '700',
  },
  sectionHint: {
    fontSize: 13,
  },
  noBook: {
    fontSize: 15,
    padding: 20,
    textAlign: 'center',
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rank: {
    width: 16,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  bookTexts: {
    flex: 1,
  },
  bookTitle: {
    fontFamily: serifFont,
    fontSize: 16,
    fontWeight: '700',
  },
  bookAuthor: {
    fontSize: 13,
    marginTop: 4,
  },
  addsBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addsText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
