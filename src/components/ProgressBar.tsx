import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../theme/useThemeColors';

interface ProgressBarProps {
  percent: number; // de 0 à 100
  showPercent?: boolean; // pourcentage à droite (oui par défaut)
}

// Barre de progression de lecture
export default function ProgressBar({ percent, showPercent = true }: ProgressBarProps): JSX.Element {
  const colors = useThemeColors();

  return (
    <View
      style={styles.row}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel="Progression"
      accessibilityValue={{ min: 0, max: 100, now: percent }}
    >
      <View style={[styles.track, { backgroundColor: colors.progressTrack }]}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: colors.primary }]} />
      </View>
      {showPercent && <Text style={[styles.percent, { color: colors.textSecondary }]}>{percent + ' %'}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
  percent: {
    width: 48,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
  },
});
