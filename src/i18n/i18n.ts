import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import { en } from './en';
import { fr, type Translations } from './fr';

export type Language = 'fr' | 'en';
export const languages: Language[] = ['fr', 'en'];

// Valeurs insérées dans un texte (%{name}) ; count choisit le singulier ou le pluriel
export type TranslateOptions = Record<string, string | number>;

// Toutes les clés possibles, ex. 'library.title' : une faute de frappe est une erreur TypeScript
type PluralText = { one: string; other: string };
type KeyPaths<T> = {
  [K in keyof T & string]: T[K] extends string | PluralText ? K : `${K}.${KeyPaths<T[K]>}`;
}[keyof T & string];
export type TranslationKey = KeyPaths<Translations>;

export const i18n = new I18n({ fr: fr, en: en });
i18n.defaultLocale = 'fr';
i18n.enableFallback = true; // clé absente en anglais : texte français

// Langue du téléphone : français si le téléphone est en français, anglais sinon
export function getDeviceLanguage(): Language {
  const locales = getLocales();
  if (locales.length > 0 && locales[0].languageCode === 'fr') {
    return 'fr';
  }
  return 'en';
}

i18n.locale = getDeviceLanguage();

// Traduction hors des écrans (services, utilitaires) : langue courante d'i18n
export function translate(key: TranslationKey, options?: TranslateOptions): string {
  return i18n.t(key, options);
}

// Format des dates et des nombres selon la langue : « 12 mai 2026 » ou « 12 May 2026 »
export function getLocaleTag(): string {
  if (i18n.locale === 'en') {
    return 'en-GB';
  }
  return 'fr-FR';
}
