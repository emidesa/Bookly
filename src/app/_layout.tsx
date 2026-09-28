import type { JSX } from 'react';
import { Stack } from 'expo-router';

// Layout racine : les groupes gèrent leurs propres en-têtes
export default function RootLayout(): JSX.Element {
  return <Stack screenOptions={{ headerShown: false }} />;
}
