import { useState, type JSX } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AnimatedSplash from '../components/AnimatedSplash';
import { AuthProvider, useAuth } from '../context/AuthContext';

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

  // AuthProvider autour de toute l'app : useAuth() disponible dans tous les écrans
  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <RootNavigator />
        {showSplash && <AnimatedSplash onFinish={() => setShowSplash(false)} />}
      </View>
    </AuthProvider>
  );
}
