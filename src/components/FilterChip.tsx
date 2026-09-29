import type { JSX } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useThemeColors } from '../theme/useThemeColors';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  count?: number; // affiché à côté du libellé (ex. « Tous 12 »)
}

// Bouton de filtre ; fond indigo quand il est sélectionné
export default function FilterChip({ label, selected, onPress, accessibilityLabel, count }: FilterChipProps): JSX.Element {
  const colors = useThemeColors();

  let backgroundColor = colors.surface;
  let textColor = colors.text;
  // Contour léger : c'est le texte qui identifie le bouton (WCAG 1.4.11)
  let borderColor = colors.separator;
  if (selected) {
    backgroundColor = colors.primary;
    textColor = colors.onPrimary;
    borderColor = colors.primary;
  }

  let text = label;
  if (count !== undefined) {
    text = label + '  ' + count;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: selected }}
      style={[styles.chip, { backgroundColor: backgroundColor, borderColor: borderColor }]}
    >
      <Text style={[styles.label, { color: textColor }]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 48, // taille de toucher minimale recommandée (44)
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
