import { useCallback, useState, type JSX } from 'react';
import { ActivityIndicator, Alert, FlatList, Keyboard, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdminMenuButton from '../../components/AdminMenuButton';
import EmptyState from '../../components/EmptyState';
import ScreenHeader from '../../components/ScreenHeader';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getLocaleTag, type TranslationKey } from '../../i18n/i18n';
import { deleteUser, getUsers } from '../../services/adminService';
import { serifFont } from '../../theme/fonts';
import { useThemeColors } from '../../theme/useThemeColors';
import type { AdminUser } from '../../types/admin';
import type { Role } from '../../types/user';
import { getErrorMessage } from '../../utils/getErrorMessage';

// Clés des libellés de la maquette
const roleKeys: Record<Role, TranslationKey> = {
  reader: 'adminUsers.roles.reader',
  admin: 'adminUsers.roles.admin',
};

// « camille.martin@… » → « CM » ; sinon l'initiale du prénom
function getInitials(user: AdminUser): string {
  const parts = user.email.split('@')[0].split(/[._-]/).filter((part) => part !== '');
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return user.first_name.charAt(0).toUpperCase();
}

export default function AdminUsersScreen(): JSX.Element {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { user: currentUser, logout } = useAuth();
  const { t } = useLanguage();

  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  const loadUsers = useCallback(async (): Promise<void> => {
    try {
      setUsers(await getUsers());
      setUpdatedAt(new Date());
      setLoadError(null);
    } catch (error) {
      setLoadError(getErrorMessage(error, t('adminUsers.loadError')));
    }
  }, [t]);

  // Rechargé à chaque affichage de l'écran
  useFocusEffect(
    useCallback(() => {
      void loadUsers();
    }, [loadUsers]),
  );

  // Tirer la liste vers le bas pour rafraîchir
  async function refresh(): Promise<void> {
    setIsRefreshing(true);
    await loadUsers();
    setIsRefreshing(false);
  }

  function confirmDelete(target: AdminUser): void {
    const isSelf = currentUser !== null && target.id === currentUser.id;
    let message = t('adminUsers.deleteMessage', { email: target.email, books: t('adminUsers.books', { count: target.book_count }) });
    if (isSelf) {
      message = message + '\n\n' + t('adminUsers.selfWarning');
    }

    Alert.alert(t('adminUsers.deleteTitle'), message, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          void deleteUser(target.id)
            .then(() => {
              if (isSelf) {
                void logout();
                return;
              }
              // Retiré de la liste sans recharger
              setUsers((previous) => (previous === null ? previous : previous.filter((item) => item.id !== target.id)));
            })
            .catch((error: unknown) => {
              Alert.alert(t('adminUsers.deleteFailedTitle'), getErrorMessage(error, t('common.unknownError')));
            });
        },
      },
    ]);
  }

  // Filtre fait dans l'app : la liste est déjà chargée
  const search = query.trim().toLowerCase();
  let visibleUsers: AdminUser[] = users ?? [];
  if (search !== '') {
    visibleUsers = visibleUsers.filter(
      (item) => item.email.toLowerCase().includes(search) || item.first_name.toLowerCase().includes(search),
    );
  }

  const countText = t('adminUsers.count', { count: visibleUsers.length });
  let updatedText = '';
  if (updatedAt !== null) {
    updatedText = t('adminUsers.updatedAt', { time: updatedAt.toLocaleTimeString(getLocaleTag(), { hour: '2-digit', minute: '2-digit' }) });
  }

  const header = (
    <View>
      <ScreenHeader overline={t('admin.menu')} title={t('adminUsers.title')} right={<AdminMenuButton current="users" />} />

      {/* Même champ que l'écran Recherche (contour visible, WCAG 1.4.11) */}
      <View style={[styles.searchField, { backgroundColor: colors.surface, borderColor: colors.inputBorder }]}>
        <SymbolView name={{ ios: 'magnifyingglass', android: 'search' }} size={22} tintColor={colors.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => Keyboard.dismiss()}
          placeholder={t('adminUsers.searchPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={t('adminUsers.searchLabel')}
          style={[styles.searchInput, { color: colors.text }]}
        />
        {query !== '' && (
          <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel={t('common.clearSearch')} hitSlop={12}>
            <SymbolView name={{ ios: 'xmark.circle.fill', android: 'cancel' }} size={20} tintColor={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <View style={styles.countRow}>
        <Text style={[styles.count, { color: colors.text }]} accessibilityRole="header">
          {countText}
        </Text>
        <Text style={[styles.updated, { color: colors.textSecondary }]}>{updatedText}</Text>
      </View>
    </View>
  );

  function renderUser({ item }: { item: AdminUser }): JSX.Element {
    const isAdmin = item.role === 'admin';
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
        {/* Infos lues d'un bloc ; la poubelle reste un bouton séparé */}
        <View
          style={styles.cardInfo}
          accessible
          accessibilityLabel={item.email + ', ' + t(roleKeys[item.role]) + ', ' + t('adminUsers.books', { count: item.book_count })}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{getInitials(item)}</Text>
          </View>
          <View style={styles.texts}>
            <Text style={[styles.email, { color: colors.text }]} numberOfLines={1}>
              {item.email}
            </Text>
            <View style={styles.metaRow}>
              <View style={[styles.roleBadge, { backgroundColor: isAdmin ? colors.primarySoft : colors.surfaceElevated }]}>
                <Text style={[styles.roleText, { color: isAdmin ? colors.primary : colors.textSecondary }]}>
                  {t(roleKeys[item.role])}
                </Text>
              </View>
              <Text style={[styles.bookCount, { color: colors.textSecondary }]}>{t('adminUsers.books', { count: item.book_count })}</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => confirmDelete(item)}
          accessibilityRole="button"
          accessibilityLabel={t('adminUsers.deleteLabel', { email: item.email })}
          style={({ pressed }) => [styles.deleteButton, { backgroundColor: colors.errorSoft, opacity: pressed ? 0.7 : 1 }]}
        >
          <SymbolView name={{ ios: 'trash', android: 'delete' }} size={20} tintColor={colors.error} />
        </Pressable>
      </View>
    );
  }

  // Premier chargement : roue ou erreur
  if (users === null) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        {loadError !== null ? (
          <EmptyState message={loadError} isError={true} buttonLabel={t('common.retry')} onPress={() => void loadUsers()} />
        ) : (
          <ActivityIndicator size="large" color={colors.primary} accessibilityLabel={t('common.loading')} />
        )}
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.list, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
      data={visibleUsers}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderUser}
      ListHeaderComponent={header}
      ListEmptyComponent={<EmptyState message={t('adminUsers.noMatch')} />}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 20,
    gap: 12,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 60,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 12,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 4,
  },
  count: {
    fontFamily: serifFont,
    fontSize: 22,
    fontWeight: '700',
  },
  updated: {
    fontSize: 13,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  cardInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  texts: {
    flex: 1,
  },
  email: {
    fontSize: 15,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  roleBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bookCount: {
    fontSize: 13,
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
