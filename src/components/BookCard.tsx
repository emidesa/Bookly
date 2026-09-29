import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BookCover from './BookCover';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';
import { serifFont } from '../theme/fonts';
import { useThemeColors } from '../theme/useThemeColors';
import { BookStatus, statusLabels } from '../types/book';

interface BookCardProps {
  title: string;
  author: string | null;
  coverUrl: string | null;
  status?: BookStatus; // uniquement pour les livres de la PAL
  progressPercent?: number | null; // calculé par le backend ; null = pages inconnues
  onPress?: () => void; // carte cliquable si fourni
}

export default function BookCard({ title, author, coverUrl, status, progressPercent, onPress }: BookCardProps): JSX.Element {
  const colors = useThemeColors();

  // Progression : seulement pour un livre de la PAL dont le nombre de pages est connu
  let percent: number | null = null;
  if (progressPercent !== undefined) {
    percent = progressPercent;
  }

  // Phrase lue par VoiceOver pour toute la carte
  let label = title;
  if (author !== null) {
    label = label + ', de ' + author;
  }
  if (status !== undefined) {
    label = label + ', ' + statusLabels[status];
  }
  if (percent !== null) {
    label = label + ', lu à ' + percent + ' %';
  }

  const isPressable = onPress !== undefined;

  return (
    <Pressable
      onPress={onPress}
      disabled={!isPressable}
      accessible={true}
      accessibilityLabel={label}
      accessibilityRole={isPressable ? 'button' : 'text'}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.separator }]}
    >
      <BookCover title={title} author={author} coverUrl={coverUrl} width={100} />

      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        {author !== null && (
          <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
            {author}
          </Text>
        )}
        {status !== undefined && (
          <View style={styles.badge}>
            <StatusBadge status={status} />
          </View>
        )}
        {percent !== null && (
          <View style={styles.progress}>
            <ProgressBar percent={percent} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  info: {
    flex: 1,
    marginLeft: 20,
  },
  title: {
    fontFamily: serifFont,
    fontSize: 20,
    fontWeight: '700',
  },
  author: {
    fontSize: 15,
    marginTop: 6,
  },
  badge: {
    marginTop: 12,
  },
  progress: {
    marginTop: 'auto', // collée en bas de la carte
    paddingTop: 12,
  },
});
