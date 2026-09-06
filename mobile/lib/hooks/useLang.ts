import { useTranslation } from 'react-i18next';

export type Lang = 'ar' | 'en';

/** Current UI language as the 2-letter code used by shared formatters. */
export function useLang(): Lang {
  const { i18n } = useTranslation();
  return i18n.language === 'en' ? 'en' : 'ar';
}

export function pick<T extends Record<string, unknown>>(obj: T, key: string, lang: Lang): string {
  const ar = obj[`${key}_ar`];
  const en = obj[key];
  const v = lang === 'ar' ? ar ?? en : en ?? ar;
  return typeof v === 'string' ? v : '';
}
