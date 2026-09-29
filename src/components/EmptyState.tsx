import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { useThemeColors } from '../theme/useThemeColors';

interface EmptyStateProps {
  message: string;
  isError?: boolean; // texte rouge, annoncé tout de suite par VoiceOver
  buttonLabel?: string; // bouton affiché seulement si buttonLabel et onPress sont fournis
  onPress?: () => void;
}

// Message centré avec un bouton facultatif (liste vide, erreur, serveur injoignable...)
export default function EmptyState({ message, isError = false, buttonLabel, onPress }: EmptyStateProps): JSX.Element {
  const colors = useThemeColors();

  let textColor = colors.textSecondary;
  if (isError) {
    textColor = colors.error;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.message, { color: textColor }]} accessibilityRole={isError ? 'alert' : 'text'}>
        {message}
      </Text>
      {buttonLabel !== undefined && onPress !== undefined && (
        <View style={styles.button}>
          <PrimaryButton label={buttonLabel} onPress={onPress} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 32,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
  },
});
