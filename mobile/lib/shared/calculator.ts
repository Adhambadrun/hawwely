/* AUTO-GENERATED from website lib/ by scripts/sync-shared.js — do not edit. */
/**
 * HAWWELY rate calculation engine.
 *
 * This is the single source of truth for "how much will my family receive?".
 * It is pure (no I/O) so it can run on the server, on the edge, in the browser
 * and inside unit tests.
 *
 * Conventions:
 *  - `percentFee` is a FRACTION (0.01 = 1%). The database stores `percent_fee`
 *    as a percentage (1 = 1%), so convert at the boundary with `percentToFraction`.
 *  - All money math is done in floating point and rounded only for display.
 */

import type { PayoutMethod, TransferSpeed } from './types';

export interface ServiceRate {
  serviceId: string;
  serviceSlug: string;
  serviceName: string;
  exchangeRate: number; // Rate offered by this service (EGP per 1 unit of send currency)
  fixedFee: number; // Fixed fee in send currency
  percentFee: number; // Percentage fee as a fraction (0.01 = 1%)
  minAmount: number | null;
  maxAmount: number | null;
  speed: TransferSpeed;
  speedMinutes: number;
  payoutMethods: PayoutMethod[];
  rating?: number;
}

export interface ComparisonResult {
  service: ServiceRate;
  totalFees: number; // Total fees in send currency
  amountAfterFees: number; // Amount after deducting fees (in send currency)
  amountReceived: number; // Final amount in EGP
  idealReceived: number; // What you'd get at mid-market with zero fees
  totalLoss: number; // idealReceived - amountReceived (EGP)
  visibleFeeEgp: number; // Fees converted to EGP at mid-market (the "visible" cost)
  hiddenFeeEgp: number; // Exchange-rate markup cost in EGP (the "hidden" cost)
  totalCostPercent: number; // Total cost as % (fees + markup)
  markupPercent: number; // Exchange rate markup vs mid-market (%)
  savingsVsWorst: number; // How much saved vs worst option (EGP)
  rank: number;
}

export type SkipReason = 'below_min' | 'above_max' | 'fee_exceeds_amount';

export interface CompareOutput {
  results: ComparisonResult[];
  skipped: { service: ServiceRate; reason: SkipReason }[];
}

export function percentToFraction(percent: number): number {
  return percent / 100;
}

export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** Calculate a single service's outcome. Returns null when the amount is not eligible. */
export function calculateSingle(
  amount: number,
  midMarketRate: number,
  service: ServiceRate,
): { result: Omit<ComparisonResult, 'rank' | 'savingsVsWorst'> } | { skipped: SkipReason } {
  if (service.minAmount != null && amount < service.minAmount) return { skipped: 'below_min' };
  if (service.maxAmount != null && amount > service.maxAmount) return { skipped: 'above_max' };

  // Step 1: Calculate fees
  const fixedFeeDeduction = service.fixedFee;
  const percentFeeDeduction = amount * service.percentFee;
  const totalFees = fixedFeeDeduction + percentFeeDeduction;
  const amountAfterFees = amount - totalFees;
  if (amountAfterFees <= 0) return { skipped: 'fee_exceeds_amount' };

  // Step 2: Apply exchange rate
  const amountReceived = amountAfterFees * service.exchangeRate;

  // Step 3: What you SHOULD have received at mid-market
  const idealReceived = amount * midMarketRate;

  // Step 4: Total cost percentage
  const totalLoss = idealReceived - amountReceived;
  const totalCostPercent = idealReceived > 0 ? (totalLoss / idealReceived) * 100 : 0;

  // Step 5: Markup percentage
  const markupPercent = midMarketRate > 0 ? ((midMarketRate - service.exchangeRate) / midMarketRate) * 100 : 0;

  // Visible vs hidden cost split (both in EGP)
  const visibleFeeEgp = totalFees * midMarketRate;
  const hiddenFeeEgp = amountAfterFees * (midMarketRate - service.exchangeRate);

  return {
    result: {
      service,
      totalFees,
      amountAfterFees,
      amountReceived,
      idealReceived,
      totalLoss,
      visibleFeeEgp,
      hiddenFeeEgp,
      totalCostPercent,
      markupPercent,
    },
  };
}

/**
 * Compare all services for a given amount.
 * Results are sorted by amountReceived (highest first = cheapest for user).
 */
export function compare(amount: number, midMarketRate: number, services: ServiceRate[]): CompareOutput {
  const results: ComparisonResult[] = [];
  const skipped: CompareOutput['skipped'] = [];

  for (const service of services) {
    const outcome = calculateSingle(amount, midMarketRate, service);
    if ('skipped' in outcome) {
      skipped.push({ service, reason: outcome.skipped });
      continue;
    }
    results.push({ ...outcome.result, savingsVsWorst: 0, rank: 0 });
  }

  results.sort((a, b) => {
    if (b.amountReceived !== a.amountReceived) return b.amountReceived - a.amountReceived;
    // tie-breaker: faster first, then higher rating
    if (a.service.speedMinutes !== b.service.speedMinutes) return a.service.speedMinutes - b.service.speedMinutes;
    return (b.service.rating ?? 0) - (a.service.rating ?? 0);
  });

  if (results.length > 0) {
    const worstReceived = results[results.length - 1].amountReceived;
    results.forEach((r, i) => {
      r.rank = i + 1;
      r.savingsVsWorst = r.amountReceived - worstReceived;
    });
  }

  return { results, skipped };
}

/** Identify the fastest service (lowest speedMinutes; ties broken by amount received). */
export function findFastest(results: ComparisonResult[]): ComparisonResult | null {
  if (results.length === 0) return null;
  return results.reduce((best, r) => {
    if (r.service.speedMinutes < best.service.speedMinutes) return r;
    if (r.service.speedMinutes === best.service.speedMinutes && r.amountReceived > best.amountReceived) return r;
    return best;
  });
}

/** Identify the best-rated service (ties broken by amount received). */
export function findBestRated(results: ComparisonResult[]): ComparisonResult | null {
  if (results.length === 0) return null;
  return results.reduce((best, r) => {
    const br = best.service.rating ?? 0;
    const rr = r.service.rating ?? 0;
    if (rr > br) return r;
    if (rr === br && r.amountReceived > best.amountReceived) return r;
    return best;
  });
}

/**
 * Monthly/yearly loss calculator used on the homepage "كم بتخسر كل شهر؟" section.
 * Compares the best and worst services for a monthly amount.
 */
export function calculateMonthlyLoss(
  monthlyAmount: number,
  midMarketRate: number,
  services: ServiceRate[],
): { best: ComparisonResult; worst: ComparisonResult; monthlyLoss: number; yearlyLoss: number } | null {
  const { results } = compare(monthlyAmount, midMarketRate, services);
  if (results.length < 2) return null;
  const best = results[0];
  const worst = results[results.length - 1];
  const monthlyLoss = best.amountReceived - worst.amountReceived;
  return { best, worst, monthlyLoss, yearlyLoss: monthlyLoss * 12 };
}

/** Effective rate after all fees: EGP received per 1 unit sent. */
export function effectiveRate(result: Pick<ComparisonResult, 'amountReceived'>, amount: number): number {
  return amount > 0 ? result.amountReceived / amount : 0;
}
