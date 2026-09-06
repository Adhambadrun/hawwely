import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import ar from './locales/ar.json';
import en from './locales/en.json';

export const SUPPORTED_LANGUAGES = ['ar', 'en'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function detectDeviceLanguage(): AppLanguage {
  const code = getLocales()[0]?.languageCode ?? 'ar';
  return code === 'en' ? 'en' : 'ar';
}

export function initI18n(language: AppLanguage) {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      compatibilityJSON: 'v4',
      resources: { ar: { translation: ar }, en: { translation: en } },
      lng: language,
      fallbackLng: 'ar',
      interpolation: { escapeValue: false },
      returnNull: false,
    });
  } else if (i18n.language !== language) {
    void i18n.changeLanguage(language);
  }
  return i18n;
}

export default i18n;
