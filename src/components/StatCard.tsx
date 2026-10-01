import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { useLanguage } from '../context/LanguageContext';
import { getLocaleTag } from '../i18n/i18n';
import { serifFont } from '../theme/fonts';
import { useThemeColors } from '../theme/useThemeColors';

interface StatCardProps {
  value: number | undefined; // undefined pendant le chargement
  label: string;
  icon: { ios: SFSymbol; android: AndroidSymbol };
  iconBackground: string;
  iconColor: string;
}

// Petite carte de statistique (Profil et Statistiques admin), lue comme un seul élément
export default function StatCard({ value, label, icon, iconBackground, iconColor }: StatCardProps): JSX.Element {
  const colors = useThemeColors();
  const { t } = useLanguage();

  // « 6842 » devient « 6 842 » ; tiret tant que la valeur n'est pas connue
  const text = value === undefined ? '–' : value.toLocaleString(getLocaleTag());

  return (
    <View
      accessible
      accessibilityLabel={value === undefined ? t('profile.statLoading', { label: label }) : text + ' ' + label}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.separator }]}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBackground }]}>
        <SymbolView name={icon} size={22} tintColor={iconColor} />
      </View>
      <View style={styles.texts}>
        <Text style={[styles.value, { color: colors.text }]}>{text}</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flexShrink: 1,
  },
  value: {
    fontFamily: serifFont,
    fontSize: 22,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
  },
});
