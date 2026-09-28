import type { JSX } from 'react';
import { Tabs } from 'expo-router';

// Onglets du lecteur ; book/[id] et session-form sont cachés de la barre
export default function ReaderLayout(): JSX.Element {
  return (
    <Tabs>
      <Tabs.Screen name="library" options={{ title: 'PAL', tabBarAccessibilityLabel: 'Ma pile à lire' }} />
      <Tabs.Screen name="search" options={{ title: 'Recherche', tabBarAccessibilityLabel: 'Rechercher un livre' }} />
      <Tabs.Screen name="scanner" options={{ title: 'Scanner', tabBarAccessibilityLabel: 'Scanner un code-barres' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarAccessibilityLabel: 'Mon profil' }} />
      <Tabs.Screen name="book/[id]" options={{ href: null, title: 'Livre' }} />
      <Tabs.Screen name="session-form" options={{ href: null, title: 'Session' }} />
    </Tabs>
  );
}
