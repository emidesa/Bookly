import type { JSX } from 'react';
import { Tabs } from 'expo-router';
import GlassTabBar from '../../components/GlassTabBar';
import { useLanguage } from '../../context/LanguageContext';

// Onglets du lecteur : barre flottante personnalisée, en-têtes gérés par chaque écran
export default function ReaderLayout(): JSX.Element {
  const { t } = useLanguage();

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <GlassTabBar {...props} />}>
      <Tabs.Screen name="library" options={{ title: t('tabs.library') }} />
      <Tabs.Screen name="search" options={{ title: t('tabs.search') }} />
      <Tabs.Screen name="scanner" options={{ title: t('tabs.scanner') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
      <Tabs.Screen name="book/[id]" options={{ href: null, title: t('tabs.book') }} />
      <Tabs.Screen name="session-form" options={{ href: null, title: t('tabs.session') }} />
    </Tabs>
  );
}
