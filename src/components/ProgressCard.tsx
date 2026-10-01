import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ProgressBar from './ProgressBar';
import { useLanguage } from '../context/LanguageContext';
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
  const { t } = useLanguage();

  // Nombre de pages inconnu : pas de carte
  if (percent === null || totalPages === null || remainingPages === null) {
    return null;
  }

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.separator }]}
      accessible={true}
      accessibilityLabel={t('progress.a11y', { percent: percent, current: currentPage, total: totalPages, remaining: t('progress.remaining', { count: remainingPages }) })}
    >
      <View style={styles.top}>
        <Text style={[styles.label, { color: colors.text }]}>{t('progress.title')}</Text>
        <Text style={[styles.percent, { color: colors.primary }]}>{percent + ' %'}</Text>
      </View>
      <ProgressBar percent={percent} showPercent={false} />
      <View style={styles.bottom}>
        <Text style={[styles.detail, { color: colors.textSecondary }]}>{t('progress.pageOf', { current: currentPage, total: totalPages })}</Text>
        <Text style={[styles.detail, { color: colors.textSecondary }]}>{t('progress.remaining', { count: remainingPages })}</Text>
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
