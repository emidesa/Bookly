import type { JSX } from 'react';
import { Tabs } from 'expo-router';
import GlassTabBar from '../../components/GlassTabBar';

// Onglets du lecteur : barre flottante personnalisée, en-têtes gérés par chaque écran
export default function ReaderLayout(): JSX.Element {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <GlassTabBar {...props} />}>
      <Tabs.Screen name="library" options={{ title: 'PAL' }} />
      <Tabs.Screen name="search" options={{ title: 'Recherche' }} />
      <Tabs.Screen name="scanner" options={{ title: 'Scanner' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
      <Tabs.Screen name="book/[id]" options={{ href: null, title: 'Livre' }} />
      <Tabs.Screen name="session-form" options={{ href: null, title: 'Session' }} />
    </Tabs>
  );
}
