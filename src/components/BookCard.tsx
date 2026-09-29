import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
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
  pagesRead?: number | null;
  totalPages?: number | null;
  onPress?: () => void; // carte cliquable si fourni
}

// Pourcentage lu, ou null si on ne peut pas le calculer
function getProgressPercent(status: BookStatus | undefined, pagesRead: number | null | undefined, totalPages: number | null | undefined): number | null {
  if (status === undefined || totalPages === null || totalPages === undefined || totalPages <= 0) {
    return null;
  }
  if (status === 'read') {
    return 100;
  }
  if (pagesRead === null || pagesRead === undefined) {
    return 0;
  }
  const percent = Math.round((pagesRead * 100) / totalPages);
  if (percent > 100) {
    return 100;
  }
  return percent;
}

export default function BookCard({ title, author, coverUrl, status, pagesRead, totalPages, onPress }: BookCardProps): JSX.Element {
  const colors = useThemeColors();
  const percent = getProgressPercent(status, pagesRead, totalPages);

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
      <View style={[styles.coverShadow, { shadowColor: colors.shadow }]}>
        {coverUrl !== null ? (
          <Image source={{ uri: coverUrl }} style={styles.cover} contentFit="cover" />
        ) : (
          <View style={[styles.cover, styles.noCover, { backgroundColor: colors.surfaceElevated }]}>
            <Text style={[styles.noCoverTitle, { color: colors.text }]} numberOfLines={3}>
              {title}
            </Text>
            {author !== null && (
              <Text style={[styles.noCoverAuthor, { color: colors.textSecondary }]} numberOfLines={2}>
                {author.toUpperCase()}
              </Text>
            )}
          </View>
        )}
      </View>

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
  coverShadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    borderRadius: 8,
  },
  cover: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  noCover: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 8,
  },
  noCoverTitle: {
    fontFamily: serifFont,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  noCoverAuthor: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 4,
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
