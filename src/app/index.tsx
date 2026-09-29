import type { JSX } from 'react';
import { StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useThemeColors } from '../theme/useThemeColors';

// Point d'entrée : redirige selon la connexion et le rôle (appelé aussi après le login)
export default function Index(): JSX.Element | null {
  const colors = useThemeColors();
  const { status, user, retry } = useAuth();

  // Vérification du token au démarrage : le splash est affiché par-dessus
  if (status === 'loading') {
    return null;
  }

  // Serveur injoignable : le token est gardé, on propose de réessayer
  if (status === 'offline') {
    return (
      <View style={[styles.offline, { backgroundColor: colors.background }]}>
        <EmptyState
          message="Impossible de joindre le serveur. Vérifie ta connexion."
          isError={true}
          buttonLabel="Réessayer"
          onPress={() => void retry()}
        />
      </View>
    );
  }

  if (status === 'signedOut' || user === null) {
    return <Redirect href="/auth/login" />;
  }

  // Navigation différente selon le rôle
  if (user.role === 'admin') {
    return <Redirect href="/admin/users" />;
  }
  return <Redirect href="/reader/library" />;
}

const styles = StyleSheet.create({
  offline: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
});
