import type { ComponentProps, JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/useThemeColors';

// Props que expo-router donne à une barre d'onglets personnalisée
type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

interface TabItem {
  name: string; // nom du fichier dans src/app/reader
  label: string;
  icon: SFSymbol; // icône native iOS (SF Symbols)
}

// Seuls ces onglets apparaissent (book/[id] et session-form restent cachés)
const tabItems: TabItem[] = [
  { name: 'library', label: 'PAL', icon: 'books.vertical' },
  { name: 'search', label: 'Recherche', icon: 'magnifyingglass' },
  { name: 'scanner', label: 'Scanner', icon: 'barcode.viewfinder' },
  { name: 'profile', label: 'Profil', icon: 'person' },
];

// Barre d'onglets flottante et vitrée (Liquid Glass sur iOS 26, fond translucide sinon)
export default function GlassTabBar({ state, navigation }: TabBarProps): JSX.Element {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const focusedName = state.routes[state.index].name;

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
        accessibilityLabel={item.label}
        accessibilityState={{ selected: isFocused }}
        style={[styles.tab, isFocused && { backgroundColor: colors.tabActiveBackground }]}
      >
        <SymbolView name={item.icon} size={24} tintColor={color} />
        <Text style={[styles.label, { color: color }]}>{item.label}</Text>
      </Pressable>
    );
  });

  const bottom = Math.max(insets.bottom - 10, 12);

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
