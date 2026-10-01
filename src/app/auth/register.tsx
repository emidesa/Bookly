import { useRef, useState, type JSX } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, router } from 'expo-router';
import AuthLayout from '../../components/AuthLayout';
import FormError from '../../components/FormError';
import FormField from '../../components/FormField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ApiError } from '../../services/api';
import { useThemeColors } from '../../theme/useThemeColors';

export default function RegisterScreen(): JSX.Element {
  const colors = useThemeColors();
  const { register } = useAuth();
  const { t } = useLanguage();
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
      setError(t('register.missingFields'));
      return;
    }
    // Vérifié ici : inutile d'appeler le serveur si les deux saisies diffèrent
    if (password !== confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      // Inscription puis connexion automatique (AuthContext)
      await register({ first_name: firstName.trim(), email: email.trim(), password });
      router.replace('/');
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t('common.unknownError'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title={t('register.title')} subtitle={t('register.subtitle')}>
      <FormField
        label={t('auth.firstName')}
        icon={{ ios: 'person', android: 'person' }}
        value={firstName}
        onChangeText={setFirstName}
        placeholder={t('auth.firstNamePlaceholder')}
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
        label={t('auth.email')}
        icon={{ ios: 'envelope', android: 'mail' }}
        value={email}
        onChangeText={setEmail}
        placeholder={t('auth.emailPlaceholder')}
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
        label={t('auth.password')}
        icon={{ ios: 'lock', android: 'lock' }}
        hint={t('register.passwordHint')}
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
        label={t('register.confirmPassword')}
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
        <PrimaryButton label={t('register.submit')} onPress={() => void handleSubmit()} isLoading={isLoading} />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>{t('register.hasAccount')}</Text>
        <Link href="/auth/login" replace asChild>
          <Pressable accessibilityRole="link" accessibilityLabel={t('register.login')} hitSlop={12} style={styles.footerLink}>
            <Text style={[styles.footerLinkText, { color: colors.primary }]}>{t('register.login')}</Text>
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
