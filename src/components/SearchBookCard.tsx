import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BookCover from './BookCover';
import LibraryButton from './LibraryButton';
import { serifFont } from '../theme/fonts';
import { useThemeColors } from '../theme/useThemeColors';
import { GoogleBookResult } from '../types/book';

interface SearchBookCardProps {
  book: GoogleBookResult;
  inLibrary: boolean;
  isAdding: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onOpen: () => void; // appui sur le livre : ouvre le résumé
  rank?: number; // numéro dans les tendances (1, 2, 3...)
}

// Livre trouvé (recherche ou tendance) : appui = résumé, bouton = ajouter / retirer de la PAL
export default function SearchBookCard({ book, inLibrary, isAdding, onAdd, onRemove, onOpen, rank }: SearchBookCardProps): JSX.Element {
  const colors = useThemeColors();

  // Phrase lue par VoiceOver pour la zone cliquable
  let label = book.title;
  if (book.author !== null) {
    label = label + ', de ' + book.author;
  }
  if (rank !== undefined) {
    label = 'Numéro ' + rank + ' des tendances, ' + label;
  }
  label = label + '. Voir le résumé';

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
      {/* Couverture : cliquable au doigt, ignorée par VoiceOver (même action que le titre) */}
      <Pressable onPress={onOpen} accessible={false} importantForAccessibility="no-hide-descendants">
        <BookCover title={book.title} author={book.author} coverUrl={book.cover_url} width={90} />
        {rank !== undefined && (
          <View style={[styles.rank, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
            <Text style={[styles.rankText, { color: colors.onPrimary }]}>{rank}</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.info}>
        <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={label}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {book.title}
          </Text>
          {book.author !== null && (
            <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
              {book.author}
            </Text>
          )}
        </Pressable>
        <View style={styles.buttonRow}>
          <LibraryButton bookTitle={book.title} inLibrary={inLibrary} isAdding={isAdding} onAdd={onAdd} onRemove={onRemove} />
        </View>
      </View>
    </View>
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
  rank: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 13,
    fontWeight: '700',
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
  buttonRow: {
    marginTop: 'auto', // bouton collé en bas de la carte
    paddingTop: 12,
  },
});
