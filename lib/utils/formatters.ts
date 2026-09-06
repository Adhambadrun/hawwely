import { CURRENCY_META } from './constants';

type Locale = 'ar' | 'en';

/** Always use Latin digits (0-9) — Egyptian users overwhelmingly prefer them for money. */
function intlLocale(locale: Locale): string {
  return locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US';
}

export function formatNumber(value: number, locale: Locale = 'ar', options: Intl.NumberFormatOptions = {}): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(intlLocale(locale), {
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/** Format money with the currency symbol/code. e.g. "26,420 ج.م" or "2,000 SAR". */
export function formatMoney(
  value: number,
  currency: string,
  locale: Locale = 'ar',
  opts: { decimals?: number; compact?: boolean; showCode?: boolean } = {},
): string {
  if (!Number.isFinite(value)) return '—';
  const meta = CURRENCY_META[currency as keyof typeof CURRENCY_META];
  const decimals = opts.decimals ?? (Math.abs(value) >= 1000 ? 0 : meta?.decimals ?? 2);
  const num = new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    notation: opts.compact ? 'compact' : 'standard',
  }).format(value);

  if (opts.showCode || !meta) return `${num} ${currency}`;
  const label = locale === 'ar' ? meta.symbol : currency;
  return locale === 'ar' ? `${num} ${label}` : `${label === currency ? `${num} ${currency}` : `${label}${num}`}`;
}

/** EGP amounts read best in Arabic as "26,420 جنيه". */
export function formatEgp(value: number, locale: Locale = 'ar', decimals = 0): string {
  if (!Number.isFinite(value)) return '—';
  const num = new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  return locale === 'ar' ? `${num} جنيه` : `${num} EGP`;
}

/** Exchange rate with sensible precision: 13.2100, 161.50 etc. */
export function formatRate(value: number, locale: Locale = 'ar', decimals?: number): string {
  if (!Number.isFinite(value)) return '—';
  const d = decimals ?? (value >= 100 ? 2 : value >= 10 ? 3 : 4);
  return new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(value);
}

export function formatPercent(value: number, locale: Locale = 'ar', decimals = 2, signed = false): string {
  if (!Number.isFinite(value)) return '—';
  const num = new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    signDisplay: signed ? 'exceptZero' : 'auto',
  }).format(value);
  return `${num}%`;
}

export function formatDate(
  input: string | Date,
  locale: Locale = 'ar',
  style: 'short' | 'medium' | 'long' = 'medium',
): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: style, timeZone: 'Africa/Cairo' }).format(date);
}

export function formatDateTime(input: string | Date, locale: Locale = 'ar'): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Cairo',
  }).format(date);
}

/** "منذ 5 دقائق" / "5 minutes ago" */
export function timeAgo(input: string | Date, locale: Locale = 'ar', now: Date = new Date()): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '—';
  const diffSec = Math.round((now.getTime() - date.getTime()) / 1000);
  const abs = Math.abs(diffSec);

  const rtf = new Intl.RelativeTimeFormat(intlLocale(locale), { numeric: 'auto' });
  if (abs < 60) return locale === 'ar' ? 'الآن' : 'just now';
  if (abs < 3600) return rtf.format(-Math.round(diffSec / 60), 'minute');
  if (abs < 86400) return rtf.format(-Math.round(diffSec / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(-Math.round(diffSec / 86400), 'day');
  return formatDate(date, locale);
}

export function formatCompact(value: number, locale: Locale = 'ar'): string {
  return new Intl.NumberFormat(intlLocale(locale), { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

/** Parse a user-typed amount ("2,000", "٢٠٠٠", "2000.5") into a number. */
export function parseAmount(input: string): number {
  const normalized = input
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[^0-9.]/g, '');
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

/** Group digits for display while typing: 2000 -> "2,000" */
export function groupDigits(value: number | string): string {
  const n = typeof value === 'string' ? parseAmount(value) : value;
  if (!n) return '';
  const [int, dec] = String(n).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return dec != null ? `${grouped}.${dec}` : grouped;
}
