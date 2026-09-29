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

// Mêmes règles que le backend, annoncées avant la saisie
const PASSWORD_HINT = '8 caractères minimum, une majuscule, une minuscule et un chiffre.';

export default function RegisterScreen(): JSX.Element {
  const colors = useThemeColors();
  const { register } = useAuth();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(): Promise<void> {
    if (firstName.trim() === '' || email.trim() === '' || password === '' || confirmPassword === '') {
      setError('Remplis tous les champs.');
      return;
    }
    // Vérifié ici : inutile d'appeler le serveur si les deux saisies diffèrent
    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      // Inscription puis connexion automatique (AuthContext)
      await register({ first_name: firstName.trim(), email: email.trim(), password });
      router.replace('/');
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title="Créer votre compte" subtitle="Commencez à construire votre pile à lire.">
      <FormField
        label="Prénom"
        icon={{ ios: 'person', android: 'person' }}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Camille"
        autoCapitalize="words"
        autoComplete="given-name"
        textContentType="givenName"
        maxLength={50}
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <FormField
        ref={emailRef}
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
        hint={PASSWORD_HINT}
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••••"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => confirmRef.current?.focus()}
      />
      <FormField
        ref={confirmRef}
        label="Confirmer le mot de passe"
        icon={{ ios: 'lock', android: 'lock' }}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="••••••••••"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={() => void handleSubmit()}
      />

      <FormError message={error} />

      <View style={styles.submit}>
        <PrimaryButton label="S'inscrire" onPress={() => void handleSubmit()} isLoading={isLoading} />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Déjà un compte ?</Text>
        <Link href="/auth/login" replace asChild>
          <Pressable accessibilityRole="link" accessibilityLabel="Se connecter" hitSlop={12} style={styles.footerLink}>
            <Text style={[styles.footerLinkText, { color: colors.primary }]}>Se connecter</Text>
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
