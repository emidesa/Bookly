import type { JSX } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useThemeColors } from '../theme/useThemeColors';

interface LibraryButtonProps {
  bookTitle: string; // pour VoiceOver
  inLibrary: boolean; // déjà dans la PAL : « Dans ma PAL » (appui = retirer)
  isAdding: boolean; // ajout en cours : indicateur de chargement
  onAdd: () => void;
  onRemove: () => void;
}

// Bouton « + Ajouter à ma PAL » ou « ✓ Dans ma PAL »
export default function LibraryButton({ bookTitle, inLibrary, isAdding, onAdd, onRemove }: LibraryButtonProps): JSX.Element {
  const colors = useThemeColors();

  if (inLibrary) {
    return (
      <Pressable
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel={'Dans ma PAL. Retirer ' + bookTitle + ' de ma PAL'}
        style={[styles.button, styles.inLibrary, { borderColor: colors.primarySoft, backgroundColor: colors.surface }]}
      >
        <SymbolView name={{ ios: 'checkmark', android: 'check' }} size={18} tintColor={colors.primary} />
        <Text style={[styles.text, { color: colors.primary }]}>Dans ma PAL</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onAdd}
      disabled={isAdding}
      accessibilityRole="button"
      accessibilityLabel={'Ajouter ' + bookTitle + ' à ma PAL'}
      accessibilityState={{ busy: isAdding }}
      style={[styles.button, { backgroundColor: colors.primary }]}
    >
      {isAdding ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : (
        <SymbolView name={{ ios: 'plus', android: 'add' }} size={18} tintColor={colors.onPrimary} />
      )}
      <Text style={[styles.text, { color: colors.onPrimary }]}>Ajouter à ma PAL</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 24,
  },
  inLibrary: {
    borderWidth: 1.5,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
});
