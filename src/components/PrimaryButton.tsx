import type { JSX } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useThemeColors } from '../theme/useThemeColors';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean; // roue de chargement et bouton bloqué pendant l'envoi
  accessibilityLabel?: string;
}

// Bouton principal indigo (connexion, inscription, enregistrement)
export default function PrimaryButton({ label, onPress, isLoading = false, accessibilityLabel }: PrimaryButtonProps): JSX.Element {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isLoading, busy: isLoading }}
      style={({ pressed }) => [styles.button, { backgroundColor: pressed ? colors.primaryPressed : colors.primary }]}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : (
        <Text style={[styles.label, { color: colors.onPrimary }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});
