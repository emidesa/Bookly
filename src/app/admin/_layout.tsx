import type { JSX } from 'react';
import { View } from 'react-native';
import { router, Stack, type Href } from 'expo-router';
import GlassTabBarView, { type TabName } from '../../components/GlassTabBarView';
import { useThemeColors } from '../../theme/useThemeColors';

// Destination de chaque onglet depuis l'espace admin
const tabHrefs: Record<TabName, Href> = {
  library: '/reader/library',
  search: '/reader/search',
  scanner: '/reader/scanner',
  profile: '/reader/profile',
};

// Espace admin : pile ouverte depuis le menu du Profil
// En-tête natif masqué : chaque écran affiche celui de la maquette (avec le menu ☰)
export default function AdminLayout(): JSX.Element {
  const colors = useThemeColors();

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="users" />
        <Stack.Screen name="stats" />
      </Stack>
      {/* Barre du lecteur : Profil en surbrillance, l'admin s'ouvre depuis le Profil */}
      <GlassTabBarView activeName="profile" onSelect={(name) => router.navigate(tabHrefs[name])} />
    </View>
  );
}
