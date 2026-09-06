/* AUTO-GENERATED from website lib/ by scripts/sync-shared.js — do not edit. */
import type { CorridorCode, PayoutMethod, SendCurrency, SendMethod, TransferSpeed } from './types';

export const APP_NAME = 'Hawwely';
export const APP_NAME_AR = 'حوّلي';
export const TAGLINE_AR = 'أرسل أكتر.. ادفع أقل';
export const TAGLINE_EN = 'Send More. Pay Less.';

export const APP_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://hawwely.com').replace(/\/$/, '');

export const DEFAULT_SEND_CURRENCY: SendCurrency = 'SAR';
export const DEFAULT_AMOUNT = 2000;
export const MIN_AMOUNT = 1;
export const MAX_AMOUNT = 1_000_000;

/** ISR revalidation window for rate data (30 minutes) */
export const RATES_REVALIDATE_SECONDS = 1800;
/** Client auto-refresh on the live rates page (5 minutes) */
export const LIVE_REFRESH_MS = 5 * 60 * 1000;

export const SEND_CURRENCIES: SendCurrency[] = ['SAR', 'AED', 'KWD', 'USD', 'EUR', 'GBP', 'QAR', 'JOD', 'CAD', 'AUD'];

export const CURRENCY_META: Record<
  SendCurrency | 'EGP',
  { symbol: string; name: string; name_ar: string; decimals: number; defaultAmount: number; sliderMax: number; sliderStep: number }
> = {
  SAR: { symbol: 'ر.س', name: 'Saudi Riyal', name_ar: 'ريال سعودي', decimals: 2, defaultAmount: 2000, sliderMax: 10000, sliderStep: 100 },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', name_ar: 'درهم إماراتي', decimals: 2, defaultAmount: 2000, sliderMax: 10000, sliderStep: 100 },
  KWD: { symbol: 'د.ك', name: 'Kuwaiti Dinar', name_ar: 'دينار كويتي', decimals: 3, defaultAmount: 150, sliderMax: 1000, sliderStep: 10 },
  USD: { symbol: '$', name: 'US Dollar', name_ar: 'دولار أمريكي', decimals: 2, defaultAmount: 500, sliderMax: 5000, sliderStep: 50 },
  EUR: { symbol: '€', name: 'Euro', name_ar: 'يورو', decimals: 2, defaultAmount: 500, sliderMax: 5000, sliderStep: 50 },
  GBP: { symbol: '£', name: 'British Pound', name_ar: 'جنيه إسترليني', decimals: 2, defaultAmount: 500, sliderMax: 5000, sliderStep: 50 },
  QAR: { symbol: 'ر.ق', name: 'Qatari Riyal', name_ar: 'ريال قطري', decimals: 2, defaultAmount: 2000, sliderMax: 10000, sliderStep: 100 },
  JOD: { symbol: 'د.أ', name: 'Jordanian Dinar', name_ar: 'دينار أردني', decimals: 3, defaultAmount: 300, sliderMax: 2000, sliderStep: 25 },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', name_ar: 'دولار كندي', decimals: 2, defaultAmount: 500, sliderMax: 5000, sliderStep: 50 },
  AUD: { symbol: 'A$', name: 'Australian Dollar', name_ar: 'دولار أسترالي', decimals: 2, defaultAmount: 500, sliderMax: 5000, sliderStep: 50 },
  EGP: { symbol: 'ج.م', name: 'Egyptian Pound', name_ar: 'جنيه مصري', decimals: 2, defaultAmount: 0, sliderMax: 0, sliderStep: 0 },
};

export const PAYOUT_METHODS: PayoutMethod[] = ['bank_transfer', 'cash_pickup', 'mobile_wallet', 'instapay'];
export const SEND_METHODS: SendMethod[] = ['bank_transfer', 'debit_card', 'credit_card', 'apple_pay', 'cash'];

export const TRANSFER_SPEED_MINUTES: Record<TransferSpeed, number> = {
  minutes: 15,
  hours: 240,
  same_day: 720,
  '1-2 days': 2160,
  '2-3 days': 3600,
  '3-5 days': 5760,
};

export const SORT_OPTIONS = ['cheapest', 'fastest', 'rating'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const BLOG_CATEGORIES = ['guide', 'comparison', 'news', 'tips'] as const;
export const FAQ_CATEGORIES = ['general', 'rates', 'services', 'security'] as const;

export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/hawwely',
  twitter: 'https://x.com/hawwely',
  tiktok: 'https://tiktok.com/@hawwely',
  instagram: 'https://instagram.com/hawwely',
  telegram: 'https://t.me/hawwely',
  whatsapp: `https://wa.me/${process.env.EXPO_PUBLIC_WHATSAPP_NUMBER || '201000000000'}`,
} as const;

export const CONTACT_EMAIL = 'hello@hawwely.com';

/** Convert "sar-to-egp" <-> "SAR-EGP" */
export function corridorSlugToCode(slug: string): CorridorCode | null {
  const m = /^([a-z]{3})-to-egp$/i.exec(slug.trim());
  if (!m) return null;
  const cur = m[1].toUpperCase() as SendCurrency;
  if (!SEND_CURRENCIES.includes(cur)) return null;
  return `${cur}-EGP`;
}

export function corridorCodeToSlug(code: CorridorCode | string): string {
  const [from] = code.split('-');
  return `${from.toLowerCase()}-to-egp`;
}

export function currencyToSlug(currency: SendCurrency | string): string {
  return `${currency.toLowerCase()}-to-egp`;
}

export function isSendCurrency(value: string | null | undefined): value is SendCurrency {
  return !!value && SEND_CURRENCIES.includes(value.toUpperCase() as SendCurrency);
}
