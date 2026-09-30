import type { JSX } from 'react';
import { Stack } from 'expo-router';
import { useThemeColors } from '../../theme/useThemeColors';

// Espace admin : pile ouverte depuis le menu du Profil
// En-tête natif masqué : chaque écran affiche celui de la maquette (avec le menu ☰)
export default function AdminLayout(): JSX.Element {
  const colors = useThemeColors();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="users" />
      <Stack.Screen name="stats" />
    </Stack>
  );
}
