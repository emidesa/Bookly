import type { ComponentProps, JSX } from 'react';
import { Tabs } from 'expo-router';
import GlassTabBarView, { tabItems, type TabName } from './GlassTabBarView';

// Props que expo-router donne à une barre d'onglets personnalisée
type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

// Barre flottante branchée sur les onglets du lecteur (l'affichage est dans GlassTabBarView)
export default function GlassTabBar({ state, navigation }: TabBarProps): JSX.Element | null {
  const focusedName = state.routes[state.index].name;

  // Pas de barre sur les écrans hors onglets (détail d'un livre, formulaire de session)
  const activeItem = tabItems.find((item) => item.name === focusedName);
  if (activeItem === undefined) {
    return null;
  }

  function onSelect(name: TabName): void {
    const route = state.routes.find((r) => r.name === name);
    if (route === undefined) {
      return;
    }
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (name !== focusedName && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  }

  return <GlassTabBarView activeName={activeItem.name} onSelect={onSelect} />;
}
