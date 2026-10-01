import type { ComponentProps, JSX } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import type { TranslationKey } from '../i18n/i18n';
import { useThemeColors } from '../theme/useThemeColors';

// Props que expo-router donne à une barre d'onglets personnalisée
type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

interface TabItem {
  name: string; // nom du fichier dans src/app/reader
  labelKey: TranslationKey; // libellé traduit
  icon: { ios: SFSymbol; android: AndroidSymbol }; // icônes natives (SF Symbols / Material)
}

// Seuls ces onglets apparaissent (book/[id] et session-form restent cachés)
const tabItems: TabItem[] = [
  { name: 'library', labelKey: 'tabs.library', icon: { ios: 'books.vertical', android: 'library_books' } },
  { name: 'search', labelKey: 'tabs.search', icon: { ios: 'magnifyingglass', android: 'search' } },
  { name: 'scanner', labelKey: 'tabs.scanner', icon: { ios: 'barcode.viewfinder', android: 'barcode_scanner' } },
  { name: 'profile', labelKey: 'tabs.profile', icon: { ios: 'person', android: 'person' } },
];

// Barre d'onglets flottante et vitrée (Liquid Glass sur iOS 26, fond translucide sinon)
export default function GlassTabBar({ state, navigation }: TabBarProps): JSX.Element | null {
  const colors = useThemeColors();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const focusedName = state.routes[state.index].name;

  // Pas de barre sur les écrans hors onglets (détail d'un livre, formulaire de session)
  const isMainTab = tabItems.some((item) => item.name === focusedName);
  if (!isMainTab) {
    return null;
  }

  const tabs = tabItems.map((item) => {
    const route = state.routes.find((r) => r.name === item.name);
    if (route === undefined) {
      return null;
    }
    const isFocused = focusedName === item.name;

    let color = colors.textSecondary;
    if (isFocused) {
      color = colors.primary;
    }

    function onPress(): void {
      if (route === undefined) {
        return;
      }
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    }

    return (
      <Pressable
        key={item.name}
        onPress={onPress}
        accessibilityRole="tab"
        accessibilityLabel={t(item.labelKey)}
        accessibilityState={{ selected: isFocused }}
        style={[styles.tab, isFocused && { backgroundColor: colors.tabActiveBackground }]}
      >
        <SymbolView name={item.icon} size={24} tintColor={color} />
        <Text style={[styles.label, { color: color }]}>{t(item.labelKey)}</Text>
      </Pressable>
    );
  });

  // iPhone : rapprochée de la barre d'accueil ; Android : au-dessus de la navigation système
  let bottom = Math.max(insets.bottom - 10, 12);
  if (Platform.OS === 'android') {
    bottom = insets.bottom + 12;
  }

  if (isLiquidGlassAvailable()) {
    return (
      <GlassView style={[styles.bar, { bottom: bottom }]} glassEffectStyle="regular">
        {tabs}
      </GlassView>
    );
  }

  return (
    <View style={[styles.bar, styles.fallbackBorder, { bottom: bottom, backgroundColor: colors.tabBarBackground, borderColor: colors.tabBarBorder }]}>
      {tabs}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    padding: 6,
    borderRadius: 32,
    overflow: 'hidden',
  },
  // Bordure légère uniquement sans effet verre (sinon noire par défaut)
  fallbackBorder: {
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
