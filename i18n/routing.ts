import { defineRouting } from 'next-intl/routing';

export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ar';

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Arabic (default) lives at the clean root URL: /send-money/sar-to-egp
  // English is prefixed: /en/send-money/sar-to-egp
  localePrefix: 'as-needed',
  localeDetection: false,
});

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function isRtl(locale: string): boolean {
  return locale === 'ar';
}
