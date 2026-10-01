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

export default function LoginScreen(): JSX.Element {
  const colors = useThemeColors();
  const { login } = useAuth();
  const { t } = useLanguage();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(): Promise<void> {
    if (email.trim() === '' || password === '') {
      setError(t('login.missingFields'));
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      // L'accueil redirige selon le rôle
      router.replace('/');
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t('common.unknownError'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title={t('login.title')} subtitle={t('login.subtitle')}>
      <FormField
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
        <PrimaryButton label={t('login.submit')} onPress={() => void handleSubmit()} isLoading={isLoading} />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>{t('login.newUser')}</Text>
        <Link href="/auth/register" replace asChild>
          <Pressable accessibilityRole="link" accessibilityLabel={t('login.createAccount')} hitSlop={12} style={styles.footerLink}>
            <Text style={[styles.footerLinkText, { color: colors.primary }]}>{t('login.createAccount')}</Text>
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
