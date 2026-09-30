import { createContext, useContext, useEffect, type JSX, type ReactNode } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'bookly_theme'; // choix enregistré : 'light' ou 'dark'

interface ThemeContextValue {
  isDark: boolean;
  setDarkMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Mode sombre choisi par l'utilisateur et mémorisé sur le téléphone
// Appearance.setColorScheme force l'apparence de toute l'app : useThemeColors, menus, alertes et clavier suivent
export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const isDark = useColorScheme() === 'dark';

  // Au démarrage : on réapplique le choix enregistré (sinon l'app suit le réglage du téléphone)
  useEffect(() => {
    async function restoreTheme(): Promise<void> {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved === 'light' || saved === 'dark') {
          Appearance.setColorScheme(saved);
        }
      } catch {
        // Lecture impossible : on garde l'apparence du téléphone
      }
    }
    void restoreTheme();
  }, []);

  function setDarkMode(enabled: boolean): void {
    let scheme: 'light' | 'dark' = 'light';
    if (enabled) {
      scheme = 'dark';
    }
    Appearance.setColorScheme(scheme);
    // Enregistré pour les prochains lancements (sans bloquer l'affichage)
    void AsyncStorage.setItem(THEME_KEY, scheme).catch(() => undefined);
  }

  return <ThemeContext.Provider value={{ isDark: isDark, setDarkMode: setDarkMode }}>{children}</ThemeContext.Provider>;
}

// Accès au mode sombre depuis n'importe quel écran (interrupteur du Profil)
export function useThemeMode(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode doit être utilisé dans un ThemeProvider');
  }
  return context;
}
