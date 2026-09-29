import type { JSX, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { serifFont } from '../theme/fonts';
import { useThemeColors } from '../theme/useThemeColors';

interface ScreenHeaderProps {
  overline: string; // petit texte gris au-dessus (« Explorer », « Bonjour, Camille »)
  title: string; // grand titre à empattements
  right?: ReactNode; // élément facultatif à droite (avatar...)
}

// En-tête des écrans principaux (PAL, Recherche...)
export default function ScreenHeader({ overline, title, right }: ScreenHeaderProps): JSX.Element {
  const colors = useThemeColors();

  return (
    <View style={styles.row}>
      <View style={styles.titles}>
        <Text style={[styles.overline, { color: colors.textSecondary }]}>{overline}</Text>
        <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
          {title}
        </Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  titles: {
    flex: 1,
  },
  overline: {
    fontSize: 17,
    fontWeight: '500',
  },
  title: {
    fontFamily: serifFont,
    fontSize: 34,
    fontWeight: '700',
    marginTop: 4,
  },
});
