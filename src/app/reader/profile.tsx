import { useCallback, useState, type JSX } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdminMenuButton from '../../components/AdminMenuButton';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useThemeMode } from '../../context/ThemeContext';
import { getLocaleTag, languages, type Language, type TranslationKey } from '../../i18n/i18n';
import { api } from '../../services/api';
import { serifFont } from '../../theme/fonts';
import { useThemeColors } from '../../theme/useThemeColors';
import type { UserStats } from '../../types/stats';
import type { Role } from '../../types/user';
import { showOptionsMenu } from '../../utils/showOptionsMenu';

// Clés des libellés de la maquette
const roleKeys: Record<Role, TranslationKey> = {
  reader: 'profile.roles.reader',
  admin: 'profile.roles.admin',
};

// Nom de chaque langue, écrit dans cette langue (« Français », « English »)
const languageKeys: Record<Language, TranslationKey> = {
  fr: 'languages.fr',
  en: 'languages.en',
};

type SymbolName = { ios: SFSymbol; android: AndroidSymbol };

// « 6842 » devient « 6 842 » ; tiret tant que la valeur n'est pas connue
function formatCount(value: number | undefined): string {
  return value === undefined ? '–' : value.toLocaleString(getLocaleTag());
}

export default function ProfileScreen(): JSX.Element {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { isDark, setDarkMode } = useThemeMode();
  const { t, language, setLanguage } = useLanguage();
  const [stats, setStats] = useState<UserStats | null>(null);

  // Rechargé à chaque retour sur l'onglet (ex. après une nouvelle session)
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      api
        .get<UserStats>('/stats/me')
        .then((result) => {
          if (isActive) setStats(result);
        })
        .catch(() => {
          if (isActive) setStats(null);
        });
      return () => {
        isActive = false;
      };
    }, []),
  );

  function confirmLogout(): void {
    Alert.alert(t('profile.logout'), t('profile.logoutMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: () => {
          void logout().then(() => router.replace('/auth/login'));
        },
      },
    ]);
  }

  // Menu natif : Français / English
  function openLanguageMenu(): void {
    const labels = languages.map((item) => t(languageKeys[item]));
    showOptionsMenu(t('profile.language'), labels, languages.indexOf(language), (index) => {
      setLanguage(languages[index]);
    });
  }

  if (!user) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  const initial = user.first_name.charAt(0).toUpperCase();
  const isAdmin = user.role === 'admin';

  function renderStatCard(value: number | undefined, label: string, icon: SymbolName, iconBackground: string, iconColor: string): JSX.Element {
    const text = formatCount(value);
    return (
      <View
        accessible
        accessibilityLabel={value === undefined ? t('profile.statLoading', { label: label }) : text + ' ' + label}
        style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.separator }]}
      >
        <View style={[styles.iconBox, { backgroundColor: iconBackground }]}>
          <SymbolView name={icon} size={22} tintColor={iconColor} />
        </View>
        <View style={styles.statTexts}>
          <Text style={[styles.statValue, { color: colors.text }]}>{text}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120 }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
          {t('profile.title')}
        </Text>
        {/* Menu réservé aux administrateurs */}
        {isAdmin ? <AdminMenuButton /> : null}
      </View>

      <View style={[styles.card, styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
        <View accessible={false} importantForAccessibility="no-hide-descendants">
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.onPrimary }]}>{initial}</Text>
          </View>
          <View style={[styles.avatarBadge, { backgroundColor: colors.accent, borderColor: colors.surface }]}>
            <SymbolView name={{ ios: 'bookmark.fill', android: 'bookmark' }} size={13} tintColor={colors.onAccent} />
          </View>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{user.first_name}</Text>
        <Text style={[styles.email, { color: colors.text }]}>{user.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[styles.roleText, { color: colors.textSecondary }]} accessibilityLabel={t('profile.roleLabel', { role: t(roleKeys[user.role]) })}>
            {t(roleKeys[user.role])}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {renderStatCard(stats?.books_read, t('profile.booksRead'), { ios: 'book', android: 'menu_book' }, colors.primarySoft, colors.primary)}
        {renderStatCard(stats?.pages_read, t('profile.pagesRead'), { ios: 'doc.text', android: 'description' }, colors.accentSoft, colors.accentText)}
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
        {/* Mode sombre: choix mémorisé par le ThemeContext */}
        <View style={styles.settingRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.primarySoft }]}>
            <SymbolView name={{ ios: 'moon', android: 'dark_mode' }} size={20} tintColor={colors.primary} />
          </View>
          <View style={styles.settingTexts} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden={true}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>{t('profile.darkMode')}</Text>
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{t('profile.savedOnDevice')}</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={setDarkMode}
            accessibilityLabel={t('profile.darkMode')}
            trackColor={{ false: colors.inputBorder, true: colors.primary }}
            ios_backgroundColor={colors.inputBorder}
            style={styles.switch}
          />
        </View>
        <View style={[styles.divider, { backgroundColor: colors.separator }]} />
        {/* Langue : choix mémorisé par le LanguageContext */}
        <Pressable
          onPress={openLanguageMenu}
          accessibilityRole="button"
          accessibilityLabel={t('profile.languageLabel', { language: t(languageKeys[language]) })}
          style={styles.settingRow}
        >
          <View style={[styles.iconBox, { backgroundColor: colors.primarySoft }]}>
            <SymbolView name={{ ios: 'globe', android: 'language' }} size={20} tintColor={colors.primary} />
          </View>
          <View style={styles.settingTexts}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>{t('profile.language')}</Text>
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{t(languageKeys[language])}</Text>
          </View>
          <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right' }} size={16} tintColor={colors.text} />
        </Pressable>
        <View style={[styles.divider, { backgroundColor: colors.separator }]} />
        <Pressable
          onPress={() => router.push('/reader/edit-profile')}
          accessibilityRole="button"
          accessibilityLabel={t('profile.myInfo')}
          accessibilityHint={t('profile.myInfoHint')}
          style={styles.settingRow}
        >
          <View style={[styles.iconBox, { backgroundColor: colors.primarySoft }]}>
            <SymbolView name={{ ios: 'envelope', android: 'mail' }} size={20} tintColor={colors.primary} />
          </View>
          <View style={styles.settingTexts}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>{t('profile.myInfo')}</Text>
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{t('profile.myInfoHint')}</Text>
          </View>
          <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right' }} size={16} tintColor={colors.text} />
        </Pressable>
      </View>

      <Pressable
        onPress={confirmLogout}
        accessibilityRole="button"
        accessibilityLabel={t('profile.logout')}
        style={({ pressed }) => [
          styles.logoutButton,
          { backgroundColor: colors.errorSoft, borderColor: colors.error, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <SymbolView name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout' }} size={18} tintColor={colors.error} />
        <Text style={[styles.logoutText, { color: colors.error }]}>{t('profile.logout')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontFamily: serifFont,
    fontSize: 34,
    fontWeight: '700',
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: serifFont,
    fontSize: 34,
    fontWeight: '700',
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: serifFont,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 14,
  },
  email: {
    fontSize: 15,
    marginTop: 4,
  },
  roleBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTexts: {
    flexShrink: 1,
  },
  statValue: {
    fontFamily: serifFont,
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 72,
    paddingHorizontal: 16,
  },
  settingTexts: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  // Sur iPhone, Switch se colle en haut par défaut (alignSelf: 'flex-start') : on le recentre
  switch: {
    alignSelf: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
