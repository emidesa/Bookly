import { useCallback, useState, type JSX } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdminMenuButton from '../../components/AdminMenuButton';
import BookCover from '../../components/BookCover';
import EmptyState from '../../components/EmptyState';
import ScreenHeader from '../../components/ScreenHeader';
import { useLanguage } from '../../context/LanguageContext';
import { getLocaleTag, translate } from '../../i18n/i18n';
import { getAdminStats } from '../../services/adminService';
import { getTrending } from '../../services/bookService';
import { serifFont } from '../../theme/fonts';
import { useThemeColors } from '../../theme/useThemeColors';
import type { AdminStats } from '../../types/admin';
import type { TrendingBook } from '../../types/book';
import { getErrorMessage } from '../../utils/getErrorMessage';

type SymbolName = { ios: SFSymbol; android: AndroidSymbol };

// « 1248 » devient « 1 248 »
function formatCount(value: number): string {
  return value.toLocaleString(getLocaleTag());
}

// Inscriptions de ce mois comparées au mois dernier (pas de % possible si le mois dernier vaut 0)
function getGrowthText(thisMonth: number, lastMonth: number): string {
  if (lastMonth > 0) {
    const percent = Math.round(((thisMonth - lastMonth) * 100) / lastMonth);
    return translate('adminStats.growthPercent', { percent: (percent >= 0 ? '+' : '') + percent });
  }
  if (thisMonth > 0) {
    return translate('adminStats.growthCount', { count: thisMonth });
  }
  return translate('adminStats.noSignup');
}

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

  const growthText = getGrowthText(stats.users_this_month, stats.users_last_month);

  function renderSmallCard(label: string, value: number, icon: SymbolName, iconBackground: string, iconColor: string): JSX.Element {
    return (
      <View
        accessible
        accessibilityLabel={t('adminStats.cardLabel', { label: label, value: formatCount(value) })}
        style={[styles.card, styles.smallCard, { backgroundColor: colors.surface, borderColor: colors.separator }]}
      >
        <View style={[styles.iconBox, { backgroundColor: iconBackground }]}>
          <SymbolView name={icon} size={22} tintColor={iconColor} />
        </View>
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.cardValue, { color: colors.text }]}>{formatCount(value)}</Text>
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

      {/* Lecteurs + évolution des inscriptions */}
      <View
        accessible
        accessibilityLabel={t('adminStats.readersLabel', { count: formatCount(stats.total_users), growth: growthText })}
        style={[styles.card, styles.bigCard, { backgroundColor: colors.surface, borderColor: colors.separator }]}
      >
        <View style={[styles.iconBox, { backgroundColor: colors.primarySoft }]}>
          <SymbolView name={{ ios: 'person.2', android: 'group' }} size={22} tintColor={colors.primary} />
        </View>
        <View style={styles.bigCardTexts}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{t('adminStats.readers')}</Text>
          <Text style={[styles.bigValue, { color: colors.text }]}>{formatCount(stats.total_users)}</Text>
          <Text style={[styles.growth, { color: colors.accentText }]}>{growthText}</Text>
        </View>
      </View>

      <View style={styles.row}>
        {renderSmallCard(t('adminStats.booksAdded'), stats.total_books, { ios: 'book', android: 'menu_book' }, colors.primarySoft, colors.primary)}
        {renderSmallCard(t('adminStats.sessions'), stats.total_sessions, { ios: 'clock', android: 'schedule' }, colors.accentSoft, colors.accentText)}
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
  bigCard: {
    flexDirection: 'row',
    gap: 16,
    padding: 20,
  },
  bigCardTexts: {
    flex: 1,
  },
  smallCard: {
    flex: 1,
    padding: 18,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 14,
    marginTop: 12,
  },
  cardValue: {
    fontFamily: serifFont,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  bigValue: {
    fontFamily: serifFont,
    fontSize: 34,
    fontWeight: '700',
    marginTop: 4,
  },
  growth: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
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
