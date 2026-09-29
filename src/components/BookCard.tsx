import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useThemeColors } from '../theme/useThemeColors';
import { BookStatus, statusLabels } from '../types/book';

interface BookCardProps {
  title: string;
  author: string | null;
  coverUrl: string | null;
  status?: BookStatus; // uniquement pour les livres de la PAL
  onPress?: () => void; // carte cliquable si fourni
}

export default function BookCard({ title, author, coverUrl, status, onPress }: BookCardProps): JSX.Element {
  const colors = useThemeColors();

  // Phrase lue par VoiceOver pour toute la carte
  let label = title;
  if (author !== null) {
    label = label + ', de ' + author;
  }
  if (status !== undefined) {
    label = label + ', ' + statusLabels[status];
  }

  const isPressable = onPress !== undefined;

  return (
    <Pressable
      onPress={onPress}
      disabled={!isPressable}
      accessible={true}
      accessibilityLabel={label}
      accessibilityRole={isPressable ? 'button' : 'text'}
      style={[styles.card, { backgroundColor: colors.surface }]}
    >
      {coverUrl !== null ? (
        <Image source={{ uri: coverUrl }} style={styles.cover} contentFit="cover" />
      ) : (
        <View style={[styles.cover, styles.noCover, { borderColor: colors.separator }]}>
          <Text style={[styles.noCoverText, { color: colors.textSecondary }]}>Pas de couverture</Text>
        </View>
      )}

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
          <Text style={[styles.status, { color: colors.primary }]}>{statusLabels[status]}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  cover: {
    width: 64,
    height: 96,
    borderRadius: 6,
  },
  noCover: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  noCoverText: {
    fontSize: 11,
    textAlign: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  author: {
    fontSize: 14,
    marginTop: 4,
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
});
