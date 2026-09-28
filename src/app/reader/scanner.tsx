import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Écran provisoire, à remplacer
export default function ScannerScreen(): JSX.Element {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header">Scanner</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
