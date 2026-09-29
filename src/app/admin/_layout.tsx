import type { JSX } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { router, Stack } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { serifFont } from '../../theme/fonts';
import { useThemeColors } from '../../theme/useThemeColors';

// Espace admin : pile ouverte depuis le menu du Profil, avec retour vers le Profil
export default function AdminLayout(): JSX.Element {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text, fontFamily: serifFont },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        // Premier écran d'une pile imbriquée : le retour natif n'est pas toujours affiché
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Retour au profil"
            hitSlop={12}
            style={styles.back}
          >
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back' }} size={22} tintColor={colors.primary} />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="users" options={{ title: 'Comptes utilisateurs' }} />
      <Stack.Screen name="stats" options={{ title: 'Statistiques' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  back: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
});
