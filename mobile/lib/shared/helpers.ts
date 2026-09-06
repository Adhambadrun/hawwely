/* AUTO-GENERATED from website lib/ by scripts/sync-shared.js — do not edit. */
import type { PayoutMethod, TransferSpeed } from './types';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Stable, tiny non-crypto hash (FNV-1a) for seeding deterministic demo data. */
export function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Deterministic pseudo random generator (mulberry32). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  const key = 'hawwely_session_id';
  try {
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(key, id);
    return id;
  } catch {
    return 'anonymous';
  }
}

export function speedLabel(speed: TransferSpeed | string, locale: 'ar' | 'en'): string {
  const ar: Record<string, string> = {
    minutes: 'دقائق',
    hours: 'ساعات',
    same_day: 'نفس اليوم',
    '1-2 days': 'يوم-يومين',
    '2-3 days': '٢-٣ أيام',
    '3-5 days': '٣-٥ أيام',
  };
  const en: Record<string, string> = {
    minutes: 'Minutes',
    hours: 'Hours',
    same_day: 'Same day',
    '1-2 days': '1–2 days',
    '2-3 days': '2–3 days',
    '3-5 days': '3–5 days',
  };
  return (locale === 'ar' ? ar : en)[speed] ?? speed;
}

export function payoutLabel(method: PayoutMethod | string, locale: 'ar' | 'en'): string {
  const ar: Record<string, string> = {
    bank_transfer: 'بنك',
    cash_pickup: 'كاش',
    mobile_wallet: 'محفظة',
    instapay: 'إنستاباي',
  };
  const en: Record<string, string> = {
    bank_transfer: 'Bank',
    cash_pickup: 'Cash',
    mobile_wallet: 'Wallet',
    instapay: 'InstaPay',
  };
  return (locale === 'ar' ? ar : en)[method] ?? method;
}

export function sendMethodLabel(method: string, locale: 'ar' | 'en'): string {
  const ar: Record<string, string> = {
    bank_transfer: 'تحويل بنكي',
    debit_card: 'كارت خصم',
    credit_card: 'كارت ائتمان',
    apple_pay: 'Apple Pay',
    cash: 'كاش',
  };
  const en: Record<string, string> = {
    bank_transfer: 'Bank transfer',
    debit_card: 'Debit card',
    credit_card: 'Credit card',
    apple_pay: 'Apple Pay',
    cash: 'Cash',
  };
  return (locale === 'ar' ? ar : en)[method] ?? method;
}

export function pickLocalized<T extends Record<string, unknown>>(
  obj: T,
  key: string,
  locale: 'ar' | 'en',
): string {
  const arKey = `${key}_ar`;
  const ar = obj[arKey];
  const en = obj[key];
  if (locale === 'ar' && typeof ar === 'string' && ar.length > 0) return ar;
  if (typeof en === 'string' && en.length > 0) return en;
  return typeof ar === 'string' ? ar : '';
}

export function isServer(): boolean {
  return typeof window === 'undefined';
}

export function currentYear(): number {
  return new Date().getFullYear();
}

export function replaceYear(text: string | null | undefined): string {
  return (text ?? '').replace(/\{year\}/g, String(currentYear()));
}

export function getClientIp(headers: Headers): string | null {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return headers.get('x-real-ip');
}

export function safeJsonParse<T>(input: string | null, fallback: T): T {
  if (!input) return fallback;
  try {
    return JSON.parse(input) as T;
  } catch {
    return fallback;
  }
}
