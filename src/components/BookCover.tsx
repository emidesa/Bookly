import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { serifFont } from '../theme/fonts';
import { useThemeColors } from '../theme/useThemeColors';

interface BookCoverProps {
  title: string;
  author: string | null;
  coverUrl: string | null;
  width: number; // la hauteur suit le format d'un livre (x 1.5)
}

// Couverture avec ombre ; sans image, affiche le titre et l'auteur
export default function BookCover({ title, author, coverUrl, width }: BookCoverProps): JSX.Element {
  const colors = useThemeColors();
  const size = { width: width, height: width * 1.5 };

  return (
    <View style={[styles.shadow, { shadowColor: colors.shadow }]}>
      {coverUrl !== null ? (
        <Image source={{ uri: coverUrl }} style={[styles.cover, size]} contentFit="cover" accessible={false} />
      ) : (
        <View style={[styles.cover, styles.noCover, size, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[styles.title, { color: colors.text, fontSize: width / 7.5 }]} numberOfLines={3}>
            {title}
          </Text>
          {author !== null && (
            <Text style={[styles.author, { color: colors.textSecondary, fontSize: width / 11 }]} numberOfLines={2}>
              {author.toUpperCase()}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    borderRadius: 8,
  },
  cover: {
    borderRadius: 8,
  },
  noCover: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 8,
  },
  title: {
    fontFamily: serifFont,
    fontWeight: '600',
    textAlign: 'center',
  },
  author: {
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 4,
  },
});
