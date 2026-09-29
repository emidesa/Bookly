import type { JSX, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { serifFont } from '../theme/fonts';
import { useThemeColors } from '../theme/useThemeColors';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

// Décor commun des écrans de connexion et d'inscription
export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps): JSX.Element {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Décors : cercle en haut, marque-page en bas, ignorés par les lecteurs d'écran */}
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={[styles.circle, { backgroundColor: colors.primarySoft }]}
      />
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={[styles.bookmark, { bottom: insets.bottom + 16 }]}
      >
        <SymbolView name={{ ios: 'bookmark', android: 'bookmark' }} size={28} tintColor={colors.accent} />
      </View>

      {/* Le clavier remonte le contenu au lieu de cacher les champs */}
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logo} accessible accessibilityRole="image" accessibilityLabel="Bookly">
            <SymbolView name={{ ios: 'books.vertical.fill', android: 'menu_book' }} size={28} tintColor={colors.primary} />
            <Text style={[styles.logoText, { color: colors.primary }]}>Bookly</Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>

          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  circle: {
    position: 'absolute',
    top: -110,
    right: -110,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  bookmark: {
    position: 'absolute',
    right: 28,
    opacity: 0.6,
  },
  content: {
    paddingHorizontal: 24,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 48,
  },
  logoText: {
    fontFamily: serifFont,
    fontSize: 28,
    fontWeight: '700',
  },
  title: {
    fontFamily: serifFont,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 28,
  },
});
