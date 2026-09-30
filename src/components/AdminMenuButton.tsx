import type { JSX } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useThemeColors } from '../theme/useThemeColors';
import { showOptionsMenu } from '../utils/showOptionsMenu';

interface AdminMenuButtonProps {
  current?: 'users' | 'stats'; // écran admin affiché ; absent depuis le Profil
}

// Bouton ☰ du menu d'administration (Profil et écrans admin)
export default function AdminMenuButton({ current }: AdminMenuButtonProps): JSX.Element {
  const colors = useThemeColors();

  function openMenu(): void {
    // Depuis le Profil : on ouvre l'espace admin
    if (current === undefined) {
      showOptionsMenu('Administration', ['Comptes utilisateurs', 'Statistiques'], -1, (index) => {
        router.push(index === 0 ? '/admin/users' : '/admin/stats');
      });
      return;
    }

    // Depuis un écran admin : replace évite d'empiler les écrans à chaque aller-retour
    const selectedIndex = current === 'users' ? 0 : 1;
    showOptionsMenu('Administration', ['Comptes utilisateurs', 'Statistiques', 'Retour au profil'], selectedIndex, (index) => {
      if (index === 0 && current !== 'users') router.replace('/admin/users');
      if (index === 1 && current !== 'stats') router.replace('/admin/stats');
      if (index === 2) router.navigate('/reader/profile');
    });
  }

  return (
    <Pressable
      onPress={openMenu}
      accessibilityRole="button"
      accessibilityLabel="Menu administration"
      accessibilityHint="Comptes utilisateurs et statistiques"
      style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.separator }]}
    >
      <SymbolView name={{ ios: 'line.3.horizontal', android: 'menu' }} size={22} tintColor={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
