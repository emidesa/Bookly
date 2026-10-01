import { useState, type JSX } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import AnimatedSplash from '../components/AnimatedSplash';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';

// Garde le splash natif affiché jusqu'au démarrage du splash animé
SplashScreen.preventAutoHideAsync();

// Écrans autorisés selon la connexion et le rôle (Personne B)
// Un écran qui devient interdit renvoie vers index, qui redirige
function RootNavigator(): JSX.Element {
  const { status, user } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={status !== 'signedIn'}>
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'signedIn'}>
        <Stack.Screen name="reader" />
      </Stack.Protected>
      <Stack.Protected guard={user?.role === 'admin'}>
        <Stack.Screen name="admin" />
      </Stack.Protected>
    </Stack>
  );
}

// Layout racine : les groupes gèrent leurs propres en-têtes
export default function RootLayout(): JSX.Element {
  const [showSplash, setShowSplash] = useState(true);

  // LanguageProvider (langue), ThemeProvider (mode sombre) et AuthProvider autour de toute l'app
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <View style={{ flex: 1 }}>
            {/* Heure et batterie lisibles : sombres en clair, blanches en sombre */}
            <StatusBar style="auto" />
            <RootNavigator />
            {showSplash && <AnimatedSplash onFinish={() => setShowSplash(false)} />}
          </View>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
