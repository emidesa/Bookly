import { useRef, useState, type JSX } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, router } from 'expo-router';
import AuthLayout from '../../components/AuthLayout';
import FormError from '../../components/FormError';
import FormField from '../../components/FormField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/api';
import { useThemeColors } from '../../theme/useThemeColors';

export default function LoginScreen(): JSX.Element {
  const colors = useThemeColors();
  const { login } = useAuth();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(): Promise<void> {
    if (email.trim() === '' || password === '') {
      setError('Renseigne ton email et ton mot de passe.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      // L'accueil redirige selon le rôle
      router.replace('/');
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title="Bon retour parmi nous" subtitle="Retrouvez vos livres et votre progression.">
      <FormField
        label="Adresse email"
        icon={{ ios: 'envelope', android: 'mail' }}
        value={email}
        onChangeText={setEmail}
        placeholder="lectrice@exemple.fr"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <FormField
        ref={passwordRef}
        label="Mot de passe"
        icon={{ ios: 'lock', android: 'lock' }}
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••••"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={() => void handleSubmit()}
      />

      <FormError message={error} />

      <View style={styles.submit}>
        <PrimaryButton label="Se connecter" onPress={() => void handleSubmit()} isLoading={isLoading} />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Nouveau sur Bookly ?</Text>
        <Link href="/auth/register" replace asChild>
          <Pressable accessibilityRole="link" accessibilityLabel="Créer un compte" hitSlop={12} style={styles.footerLink}>
            <Text style={[styles.footerLinkText, { color: colors.primary }]}>Créer un compte</Text>
          </Pressable>
        </Link>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  submit: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 4,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    minHeight: 44,
    justifyContent: 'center',
  },
  footerLinkText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
