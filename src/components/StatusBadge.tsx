import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useThemeColors } from '../theme/useThemeColors';
import { BookStatus, statusKeys } from '../types/book';

interface StatusBadgeProps {
  status: BookStatus;
}

// Pastille colorée : gris « À lire », ambre « En cours », vert « Lu »
export default function StatusBadge({ status }: StatusBadgeProps): JSX.Element {
  const colors = useThemeColors();
  const { t } = useLanguage();

  let backgroundColor = colors.badgeToReadBackground;
  let textColor = colors.badgeToReadText;
  if (status === 'reading') {
    backgroundColor = colors.badgeReadingBackground;
    textColor = colors.badgeReadingText;
  }
  if (status === 'read') {
    backgroundColor = colors.badgeReadBackground;
    textColor = colors.badgeReadText;
  }

  return (
    <View style={[styles.badge, { backgroundColor: backgroundColor }]}>
      <Text style={[styles.label, { color: textColor }]}>{t(statusKeys[status])}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
