/**
 * App-level constants that are specific to the mobile client.
 * Shared business constants (currencies, corridors, URLs, brand colours…) come from `@/lib/shared/constants`.
 */
export { APP_URL, CURRENCY_META, SEND_CURRENCIES, SOCIAL_LINKS } from '@/lib/shared/constants';

/** Deep-link scheme registered in app.json. */
export const APP_SCHEME = 'hawwely';

/** Store listing URLs (used by the "rate the app" and "share the app" actions). */
export const STORE_URLS = {
  android: 'https://play.google.com/store/apps/details?id=com.hawwely.app',
  ios: 'https://apps.apple.com/app/hawwely/id0000000000',
} as const;

/**
 * Max age for cached responses when they are used as a *fresh* source (ms).
 * Stale entries are still shown as an offline fallback with a "last updated" note.
 */
export const CACHE_TTL = {
  rates: 30 * 60 * 1000, // matches the website's 30-minute refresh
  comparison: 30 * 60 * 1000,
  history: 6 * 60 * 60 * 1000,
  reviews: 24 * 60 * 60 * 1000,
} as const;

/** Android notification channel used for rate alerts (also declared in app.json). */
export const NOTIFICATION_CHANNEL_ID = 'rate-alerts';

/** AsyncStorage key namespace: `hawwely:store` (Zustand) and `hawwely:<cacheKey>` (response cache). */
export const STORAGE_PREFIX = 'hawwely:';

/** How many recent comparisons to keep on the home screen. */
export const MAX_RECENT_COMPARISONS = 5;

/** Quick amount chips per currency (falls back to `default`). */
export const QUICK_AMOUNTS: Record<string, number[]> = {
  default: [500, 1000, 2000, 5000],
  KWD: [50, 100, 150, 300],
  BHD: [50, 100, 200, 500],
  OMR: [50, 100, 200, 500],
  JOD: [100, 200, 300, 500],
  GBP: [200, 500, 1000, 2000],
  EUR: [200, 500, 1000, 2000],
  USD: [200, 500, 1000, 2000],
};
