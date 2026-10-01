import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useLanguage } from '../context/LanguageContext';
import { useThemeColors } from '../theme/useThemeColors';
import { ReadingSession } from '../types/readingSession';
import { formatDate } from '../utils/formatDate';

interface SessionCardProps {
  session: ReadingSession;
  onPress?: () => void; // si fourni : la carte devient un bouton (modifier / supprimer)
}

// Une session de lecture : date, pages lues et durée
export default function SessionCard({ session, onPress }: SessionCardProps): JSX.Element {
  const colors = useThemeColors();
  const { t } = useLanguage();
  const date = formatDate(session.session_date);

  // Phrase lue par VoiceOver pour toute la carte
  let label = t('sessionCard.label', { date: date, start: session.start_page, end: session.end_page });
  if (session.duration_minutes !== null) {
    label = label + ', ' + t('sessionCard.minutes', { count: session.duration_minutes });
  }

  const content = (
    <>
      <View style={styles.dateRow}>
        <View style={[styles.dot, { backgroundColor: colors.accent }]} />
        <Text style={[styles.date, { color: colors.text }]}>{date}</Text>
        {/* Flèche : indique que la carte s'ouvre */}
        {onPress !== undefined && (
          <View style={styles.chevron}>
            <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right' }} size={16} tintColor={colors.textSecondary} />
          </View>
        )}
      </View>

      <View style={styles.detailRow}>
        <SymbolView name={{ ios: 'doc.text', android: 'description' }} size={18} tintColor={colors.textSecondary} />
        <Text style={[styles.detail, { color: colors.textSecondary }]}>
          {t('sessionCard.pages', { start: session.start_page, end: session.end_page })}
        </Text>

        {session.duration_minutes !== null && (
          <View style={styles.duration}>
            <SymbolView name={{ ios: 'clock', android: 'schedule' }} size={18} tintColor={colors.textSecondary} />
            <Text style={[styles.detail, { color: colors.textSecondary }]}>{t('sessionCard.shortMinutes', { count: session.duration_minutes })}</Text>
          </View>
        )}
      </View>
    </>
  );

  const cardStyle = [styles.card, { backgroundColor: colors.surface, borderColor: colors.separator }];

  if (onPress !== undefined) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={t('sessionCard.hint')}
        style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.7 : 1 }]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} accessible={true} accessibilityLabel={label}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 14,
  },
  date: {
    fontSize: 17,
    fontWeight: '700',
  },
  chevron: {
    marginLeft: 'auto',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 24,
  },
  detail: {
    fontSize: 15,
    marginLeft: 6,
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
});
