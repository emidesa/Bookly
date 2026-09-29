import type { JSX } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { serifFont } from '../theme/fonts';
import { useThemeColors } from '../theme/useThemeColors';

// Point d'entrée : aiguille selon l'état de connexion (voir AuthContext)
export default function Index(): JSX.Element {
  const colors = useThemeColors();
  const { status, retry, logout } = useAuth();

  if (status === 'signedIn') {
    // Lecteur comme admin : l'admin accède à son espace depuis le Profil
    return <Redirect href="/reader/library" />;
  }

  if (status === 'signedOut') {
    return <Redirect href="/auth/login" />;
  }

  // Vérification du token (/api/auth/me) : peut durer plus que le splash
  if (status === 'loading') {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Chargement" />
      </View>
    );
  }

  // status === 'offline' : token gardé, serveur injoignable
  return (
    <View style={[styles.centered, styles.offline, { backgroundColor: colors.background }]}>
      <View accessible={false} importantForAccessibility="no-hide-descendants" style={[styles.iconBox, { backgroundColor: colors.primarySoft }]}>
        <SymbolView name={{ ios: 'wifi.slash', android: 'cloud_off' }} size={32} tintColor={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
        Serveur injoignable
      </Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        Vérifie ta connexion internet, puis réessaie.
      </Text>

      <View style={styles.actions}>
        <PrimaryButton label="Réessayer" onPress={() => void retry()} />
        {/* Sortie de secours si le serveur reste injoignable */}
        <Pressable
          onPress={() => void logout()}
          accessibilityRole="button"
          accessibilityLabel="Revenir à la connexion"
          style={styles.secondaryButton}
        >
          <Text style={[styles.secondaryText, { color: colors.primary }]}>Revenir à la connexion</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offline: {
    paddingHorizontal: 32,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: serifFont,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 28,
  },
  actions: {
    alignSelf: 'stretch',
    gap: 8,
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
