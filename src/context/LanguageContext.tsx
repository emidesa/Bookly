import { createContext, useCallback, useContext, useEffect, useState, type JSX, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18n, type Language, type TranslateOptions, type TranslationKey } from '../i18n/i18n';

const LANGUAGE_KEY = 'bookly_language'; // choix enregistré : 'fr' ou 'en'

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, options?: TranslateOptions) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// Langue choisie par l'utilisateur et mémorisée sur le téléphone (même principe que le mode sombre)
export function LanguageProvider({ children }: { children: ReactNode }): JSX.Element {
  const [language, setLanguageState] = useState<Language>(i18n.locale === 'en' ? 'en' : 'fr');

  // Au démarrage : on réapplique le choix enregistré (sinon la langue du téléphone)
  useEffect(() => {
    async function restoreLanguage(): Promise<void> {
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (saved === 'fr' || saved === 'en') {
          i18n.locale = saved;
          setLanguageState(saved);
        }
      } catch {
        // Lecture impossible : on garde la langue du téléphone
      }
    }
    void restoreLanguage();
  }, []);

  function setLanguage(next: Language): void {
    i18n.locale = next; // pour les textes traduits hors des écrans (api.ts, menus)
    setLanguageState(next);
    void AsyncStorage.setItem(LANGUAGE_KEY, next).catch(() => undefined);
  }

  // t change quand la langue change : tous les écrans qui l'utilisent se réaffichent
  const t = useCallback(
    (key: TranslationKey, options?: TranslateOptions): string => {
      return i18n.t(key, { ...options, locale: language });
    },
    [language],
  );

  return <LanguageContext.Provider value={{ language: language, setLanguage: setLanguage, t: t }}>{children}</LanguageContext.Provider>;
}

// Accès à la traduction depuis n'importe quel écran : const { t } = useLanguage();
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage doit être utilisé dans un LanguageProvider');
  }
  return context;
}
