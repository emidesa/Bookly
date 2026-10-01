import { useCallback, useRef, useState, type JSX } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormError from '../../components/FormError';
import FormField from '../../components/FormField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ApiError } from '../../services/api';
import { serifFont } from '../../theme/fonts';
import { useThemeColors } from '../../theme/useThemeColors';

// Retour explicite : dans des onglets, « retour » ramènerait à la PAL
function goToProfile(): void {
  router.navigate('/reader/profile');
}

export default function EditProfileScreen(): JSX.Element {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const emailRef = useRef<TextInput>(null);

  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Bouton retour d'Android : même destination que la flèche
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        goToProfile();
        return true;
      });
      return () => subscription.remove();
    }, []),
  );

  async function handleSubmit(): Promise<void> {
    if (firstName.trim() === '' || email.trim() === '') {
      setError(t('editProfile.missingFields'));
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await updateProfile({ first_name: firstName.trim(), email: email.trim() });
      goToProfile();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t('common.unknownError'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable
            onPress={goToProfile}
            accessibilityRole="button"
            accessibilityLabel={t('editProfile.backToProfile')}
            hitSlop={12}
            style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.separator }]}
          >
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back' }} size={20} tintColor={colors.primary} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
            {t('profile.myInfo')}
          </Text>
        </View>

        <FormField
          label={t('auth.firstName')}
          icon={{ ios: 'person', android: 'person' }}
          value={firstName}
          onChangeText={setFirstName}
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
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="done"
          onSubmitEditing={() => void handleSubmit()}
        />

        <FormError message={error} />

        <View style={styles.submit}>
          <PrimaryButton label={t('common.save')} onPress={() => void handleSubmit()} isLoading={isLoading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: serifFont,
    fontSize: 28,
    fontWeight: '700',
  },
  submit: {
    marginTop: 8,
  },
});
