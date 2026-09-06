import type { PayoutMethod, Rate, SendCurrency, TransferSpeed } from '@/lib/types';
import { TRANSFER_SPEED_MINUTES } from '@/lib/utils/constants';
import { BASELINE_MID_MARKET, CORRIDORS, UNITS_PER_USD } from './corridors';
import { SERVICES } from './services';
import { rateId } from './ids';

/**
 * Pricing profile per service. Fees are expressed in USD-equivalent and scaled
 * to the send currency so the same profile produces sensible numbers for
 * SAR, KWD, GBP, etc. `markupPercent` is the spread the provider adds on top
 * of the mid-market rate. `percentFee` is a percentage (0.65 = 0.65%).
 */
export interface PricingProfile {
  markupPercent: number;
  fixedFeeUsd: number;
  percentFee: number;
  minUsd: number | null;
  maxUsd: number | null;
  speed: TransferSpeed;
  payout: PayoutMethod;
  promo?: { text: string; text_ar: string };
  /** Optional per-corridor overrides (markup tweaks for local players). */
  corridorOverrides?: Partial<Record<SendCurrency, Partial<Pick<PricingProfile, 'markupPercent' | 'fixedFeeUsd' | 'percentFee' | 'speed'>>>>;
}

export const PRICING_PROFILES: Record<string, PricingProfile> = {
  wise: {
    markupPercent: 0,
    fixedFeeUsd: 1.2,
    percentFee: 0.65,
    minUsd: 1,
    maxUsd: 250_000,
    speed: '1-2 days',
    payout: 'bank_transfer',
    corridorOverrides: { USD: { speed: 'hours' }, GBP: { speed: 'hours' }, EUR: { speed: 'hours' } },
  },
  remitly: {
    markupPercent: 1.6,
    fixedFeeUsd: 1.99,
    percentFee: 0,
    minUsd: 1,
    maxUsd: 30_000,
    speed: 'minutes',
    payout: 'cash_pickup',
    promo: { text: 'Special rate on your first transfer', text_ar: 'سعر مميز على أول تحويل' },
  },
  'western-union': {
    markupPercent: 6.2,
    fixedFeeUsd: 6.0,
    percentFee: 0,
    minUsd: 1,
    maxUsd: 50_000,
    speed: 'minutes',
    payout: 'cash_pickup',
  },
  moneygram: {
    markupPercent: 4.1,
    fixedFeeUsd: 3.99,
    percentFee: 0,
    minUsd: 1,
    maxUsd: 10_000,
    speed: 'hours',
    payout: 'cash_pickup',
  },
  'tahweel-al-rajhi': {
    markupPercent: 0.85,
    fixedFeeUsd: 4.0,
    percentFee: 0,
    minUsd: 27,
    maxUsd: 60_000,
    speed: 'hours',
    payout: 'bank_transfer',
  },
  paysend: {
    markupPercent: 1.9,
    fixedFeeUsd: 1.5,
    percentFee: 0,
    minUsd: 2,
    maxUsd: 12_000,
    speed: 'minutes',
    payout: 'bank_transfer',
  },
  worldremit: {
    markupPercent: 2.3,
    fixedFeeUsd: 2.99,
    percentFee: 0,
    minUsd: 1,
    maxUsd: 20_000,
    speed: 'hours',
    payout: 'bank_transfer',
    promo: { text: 'First 3 transfers fee-free', text_ar: 'أول ٣ تحويلات بدون عمولة' },
  },
  sendwave: {
    markupPercent: 2.6,
    fixedFeeUsd: 0,
    percentFee: 0,
    minUsd: 1,
    maxUsd: 3_000,
    speed: 'minutes',
    payout: 'mobile_wallet',
  },
  'al-ansari': {
    markupPercent: 0.7,
    fixedFeeUsd: 6.0,
    percentFee: 0,
    minUsd: 27,
    maxUsd: 100_000,
    speed: 'hours',
    payout: 'bank_transfer',
  },
  'nbe-direct': {
    markupPercent: 1.25,
    fixedFeeUsd: 25,
    percentFee: 0,
    minUsd: 100,
    maxUsd: null,
    speed: '2-3 days',
    payout: 'bank_transfer',
  },
  cib: {
    markupPercent: 1.35,
    fixedFeeUsd: 25,
    percentFee: 0,
    minUsd: 100,
    maxUsd: null,
    speed: '2-3 days',
    payout: 'bank_transfer',
  },
  instapay: {
    markupPercent: 1.5,
    fixedFeeUsd: 0.1,
    percentFee: 0.1,
    minUsd: 1,
    maxUsd: 4_000,
    speed: 'minutes',
    payout: 'instapay',
  },
};

function roundTo(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/** Round a fee so it looks like a real published price (e.g. 18.7 SAR -> 19 SAR, 0.31 KWD -> 0.35 KWD). */
function prettyFee(feeUsd: number, currency: SendCurrency): number {
  if (feeUsd === 0) return 0;
  const raw = feeUsd * UNITS_PER_USD[currency];
  if (currency === 'KWD' || currency === 'JOD') return roundTo(Math.ceil(raw * 20) / 20, 2);
  if (raw < 3) return roundTo(Math.ceil(raw * 2) / 2, 2);
  return Math.ceil(raw);
}

function prettyLimit(usd: number | null, currency: SendCurrency): number | null {
  if (usd == null) return null;
  const raw = usd * UNITS_PER_USD[currency];
  if (raw < 10) return roundTo(raw, 1);
  const magnitude = 10 ** Math.max(0, Math.floor(Math.log10(raw)) - 1);
  return Math.round(raw / magnitude) * magnitude;
}

/**
 * Build the full `rates` dataset for a given set of mid-market rates.
 * Used by demo mode (baseline rates) and by the cron refresh job (live rates).
 */
export function buildRates(midMarket: Record<SendCurrency, number>, verifiedAt = new Date().toISOString()): Rate[] {
  const rates: Rate[] = [];
  let counter = 1;

  for (const corridor of CORRIDORS) {
    const currency = corridor.send_currency;
    const mid = midMarket[currency] ?? BASELINE_MID_MARKET[currency];

    for (const service of SERVICES) {
      if (!service.is_active) continue;
      if (!service.supported_corridors.includes(`${currency}-EGP`)) continue;
      const base = PRICING_PROFILES[service.slug];
      if (!base) continue;
      const profile = { ...base, ...(base.corridorOverrides?.[currency] ?? {}) };

      const exchangeRate = roundTo(mid * (1 - profile.markupPercent / 100), 4);
      rates.push({
        id: rateId(counter++),
        service_id: service.id,
        corridor_id: corridor.id,
        exchange_rate: exchangeRate,
        mid_market_rate: roundTo(mid, 4),
        markup_percent: roundTo(profile.markupPercent, 3),
        fixed_fee: prettyFee(profile.fixedFeeUsd, currency),
        fee_currency: currency,
        percent_fee: profile.percentFee,
        min_send_amount: prettyLimit(profile.minUsd, currency),
        max_send_amount: prettyLimit(profile.maxUsd, currency),
        transfer_speed: profile.speed,
        transfer_speed_minutes: TRANSFER_SPEED_MINUTES[profile.speed],
        payout_method: profile.payout,
        promo_active: !!profile.promo,
        promo_text: profile.promo?.text ?? null,
        promo_text_ar: profile.promo?.text_ar ?? null,
        last_verified_at: verifiedAt,
        verified_by: 'system',
        source: 'api',
        is_active: true,
      });
    }
  }

  return rates;
}

/** Static demo dataset at baseline mid-market rates. */
export const DEMO_RATES: Rate[] = buildRates(BASELINE_MID_MARKET, '2025-01-15T10:00:00.000Z');
