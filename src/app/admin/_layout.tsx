import type { JSX } from 'react';
import { Tabs } from 'expo-router';

// Onglets de l'administrateur
export default function AdminLayout(): JSX.Element {
  return (
    <Tabs>
      <Tabs.Screen name="users" options={{ title: 'Utilisateurs', tabBarAccessibilityLabel: 'Gérer les utilisateurs' }} />
    </Tabs>
  );
}
