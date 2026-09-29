import { useEffect, type JSX } from 'react';
import { AccessibilityInfo, StyleSheet, Text } from 'react-native';
import { useThemeColors } from '../theme/useThemeColors';

interface FormErrorProps {
  message: string | null;
}

// Message d'erreur d'un formulaire, lu automatiquement par VoiceOver et TalkBack
export default function FormError({ message }: FormErrorProps): JSX.Element | null {
  const colors = useThemeColors();

  useEffect(() => {
    if (message) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [message]);

  if (!message) return null;

  return (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.message, { color: colors.error, backgroundColor: colors.errorSoft }]}
    >
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  message: {
    fontSize: 14,
    fontWeight: '600',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
});
