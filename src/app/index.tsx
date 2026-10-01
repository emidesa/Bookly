import type { JSX } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { serifFont } from '../theme/fonts';
import { useThemeColors } from '../theme/useThemeColors';

// Point d'entrée : aiguille selon l'état de connexion (voir AuthContext)
export default function Index(): JSX.Element {
  const colors = useThemeColors();
  const { status, retry, logout } = useAuth();
  const { t } = useLanguage();

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
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel={t('common.loading')} />
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
        {t('home.offlineTitle')}
      </Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {t('home.offlineText')}
      </Text>

      <View style={styles.actions}>
        <PrimaryButton label={t('common.retry')} onPress={() => void retry()} />
        {/* Sortie de secours si le serveur reste injoignable */}
        <Pressable
          onPress={() => void logout()}
          accessibilityRole="button"
          accessibilityLabel={t('home.backToLogin')}
          style={styles.secondaryButton}
        >
          <Text style={[styles.secondaryText, { color: colors.primary }]}>{t('home.backToLogin')}</Text>
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
