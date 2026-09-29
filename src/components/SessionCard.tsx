import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useThemeColors } from '../theme/useThemeColors';
import { ReadingSession } from '../types/readingSession';
import { formatDate } from '../utils/formatDate';

interface SessionCardProps {
  session: ReadingSession;
}

// Une session de lecture : date, pages lues et durée
export default function SessionCard({ session }: SessionCardProps): JSX.Element {
  const colors = useThemeColors();
  const date = formatDate(session.session_date);

  // Phrase lue par VoiceOver pour toute la carte
  let label = 'Session du ' + date + ', pages ' + session.start_page + ' à ' + session.end_page;
  if (session.duration_minutes !== null) {
    label = label + ', ' + session.duration_minutes + ' minutes';
  }

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.separator }]}
      accessible={true}
      accessibilityLabel={label}
    >
      <View style={styles.dateRow}>
        <View style={[styles.dot, { backgroundColor: colors.accent }]} />
        <Text style={[styles.date, { color: colors.text }]}>{date}</Text>
      </View>

      <View style={styles.detailRow}>
        <SymbolView name={{ ios: 'doc.text', android: 'description' }} size={18} tintColor={colors.textSecondary} />
        <Text style={[styles.detail, { color: colors.textSecondary }]}>
          {'p. ' + session.start_page + ' → ' + session.end_page}
        </Text>

        {session.duration_minutes !== null && (
          <View style={styles.duration}>
            <SymbolView name={{ ios: 'clock', android: 'schedule' }} size={18} tintColor={colors.textSecondary} />
            <Text style={[styles.detail, { color: colors.textSecondary }]}>{session.duration_minutes + ' min'}</Text>
          </View>
        )}
      </View>
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
