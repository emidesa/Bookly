import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
  type ReactNode,
} from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { translate } from '../i18n/i18n';
import { api, ApiError, setAuthToken, setUnauthorizedHandler } from '../services/api';
import type { AuthResponse, LoginBody, RegisterBody, UpdateProfileBody, User } from '../types/user';

const TOKEN_KEY = 'bookly_token';

// loading : vérification au démarrage ; offline : token gardé mais serveur injoignable
export type AuthStatus = 'loading' | 'signedOut' | 'signedIn' | 'offline';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (body: LoginBody) => Promise<void>;
  register: (body: RegisterBody) => Promise<void>;
  logout: () => Promise<void>;
  retry: () => Promise<void>;
  updateProfile: (body: UpdateProfileBody) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// SecureStore n'existe pas sur le web : AsyncStorage (localStorage) à la place
const isWeb = Platform.OS === 'web';

async function saveToken(token: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

async function deleteToken(): Promise<void> {
  if (isWeb) {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

// Lecture protégée : sur Android, un token restauré par la sauvegarde peut être illisible
async function readToken(): Promise<string | null> {
  try {
    if (isWeb) {
      return await AsyncStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    await deleteToken().catch(() => undefined);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  // Refs lues par le gestionnaire de 401, appelé en dehors du rendu
  const statusRef = useRef<AuthStatus>('loading');
  const isAlertShown = useRef(false);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Enregistre une session valide (login ou /me)
  const saveSession = useCallback(async ({ token, user: newUser }: AuthResponse): Promise<void> => {
    await saveToken(token);
    setAuthToken(token);
    setUser(newUser);
    setStatus('signedIn');
  }, []);

  const clearSession = useCallback(async (): Promise<void> => {
    setAuthToken(null);
    setUser(null);
    setStatus('signedOut');
    await deleteToken().catch(() => undefined);
  }, []);

  // Le serveur confirme le token enregistré et renvoie l'utilisateur à jour
  const validateToken = useCallback(async (token: string | null): Promise<void> => {
    if (!token) {
      setStatus('signedOut');
      return;
    }

    setAuthToken(token);
    try {
      const response = await api.get<AuthResponse>('/auth/me');
      await saveSession(response);
    } catch (error) {
      // Serveur injoignable : le token est peut-être encore valide, on le garde
      if (error instanceof ApiError && error.status === 0) {
        setStatus('offline');
        return;
      }
      await clearSession();
    }
  }, [saveSession, clearSession]);

  // Token refusé pendant l'utilisation : une seule alerte, puis déconnexion
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (statusRef.current !== 'signedIn' || isAlertShown.current) return;
      isAlertShown.current = true;
      Alert.alert(
        translate('auth.sessionExpiredTitle'),
        translate('auth.sessionExpiredMessage'),
        [
          {
            text: translate('common.ok'),
            onPress: () => {
              isAlertShown.current = false;
              void clearSession();
            },
          },
        ],
        { cancelable: false },
      );
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // Au démarrage (status déjà à 'loading') : lecture du token puis vérification
  useEffect(() => {
    void readToken().then(validateToken);
  }, [validateToken]);

  // Les erreurs (ApiError) remontent à l'écran, qui affiche leur message
  const login = useCallback(
    async (body: LoginBody): Promise<void> => {
      const response = await api.post<AuthResponse>('/auth/login', body);
      await saveSession(response);
    },
    [saveSession],
  );

  // Inscription puis connexion automatique
  const register = useCallback(
    async (body: RegisterBody): Promise<void> => {
      await api.post<unknown>('/auth/register', body);
      await login({ email: body.email, password: body.password });
    },
    [login],
  );

  // Modification du profil : le serveur renvoie un token et un utilisateur à jour
  const updateProfile = useCallback(
    async (body: UpdateProfileBody): Promise<void> => {
      const response = await api.put<AuthResponse>('/auth/me', body);
      await saveSession(response);
    },
    [saveSession],
  );

  // Bouton « Réessayer » quand le serveur était injoignable
  const retry = useCallback(async (): Promise<void> => {
    setStatus('loading');
    await validateToken(await readToken());
  }, [validateToken]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, register, logout: clearSession, retry, updateProfile }),
    [status, user, login, register, clearSession, retry, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Accès à l'authentification depuis n'importe quel écran
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
