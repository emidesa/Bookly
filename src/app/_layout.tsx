import { useState, type JSX } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AnimatedSplash from '../components/AnimatedSplash';
import { AuthProvider } from '../context/AuthContext';

// Garde le splash natif affiché jusqu'au démarrage du splash animé
SplashScreen.preventAutoHideAsync();

// Layout racine : les groupes gèrent leurs propres en-têtes
export default function RootLayout(): JSX.Element {
  const [showSplash, setShowSplash] = useState(true);

  // AuthProvider autour de toute l'app : useAuth() disponible dans tous les écrans
  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
        {showSplash && <AnimatedSplash onFinish={() => setShowSplash(false)} />}
      </View>
    </AuthProvider>
  );
}
