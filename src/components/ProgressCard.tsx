import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ProgressBar from './ProgressBar';
import { useThemeColors } from '../theme/useThemeColors';

interface ProgressCardProps {
  percent: number | null; // calculés par le backend
  currentPage: number;
  totalPages: number | null;
  remainingPages: number | null;
}

// Carte « Ma progression » : pourcentage, barre, page actuelle et pages restantes
export default function ProgressCard({ percent, currentPage, totalPages, remainingPages }: ProgressCardProps): JSX.Element | null {
  const colors = useThemeColors();

  // Nombre de pages inconnu : pas de carte
  if (percent === null || totalPages === null || remainingPages === null) {
    return null;
  }

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.separator }]}
      accessible={true}
      accessibilityLabel={'Ma progression : ' + percent + ' %, page ' + currentPage + ' sur ' + totalPages + ', ' + remainingPages + ' pages restantes'}
    >
      <View style={styles.top}>
        <Text style={[styles.label, { color: colors.text }]}>Ma progression</Text>
        <Text style={[styles.percent, { color: colors.primary }]}>{percent + ' %'}</Text>
      </View>
      <ProgressBar percent={percent} showPercent={false} />
      <View style={styles.bottom}>
        <Text style={[styles.detail, { color: colors.textSecondary }]}>{'Page ' + currentPage + ' sur ' + totalPages}</Text>
        <Text style={[styles.detail, { color: colors.textSecondary }]}>{remainingPages + ' pages restantes'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 28,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 17,
  },
  percent: {
    fontSize: 24,
    fontWeight: '700',
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  detail: {
    fontSize: 14,
  },
});
