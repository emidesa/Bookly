import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Écran provisoire, à remplacer
export default function ProfileScreen(): JSX.Element {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header">Profile</Text>
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
