import { describe, expect, it } from 'vitest';
import { calculateMonthlyLoss, compare, findFastest, percentToFraction, round, type ServiceRate } from '../calculator';

const base = (over: Partial<ServiceRate>): ServiceRate => ({
  serviceId: over.serviceId ?? 'id',
  serviceSlug: over.serviceSlug ?? 'slug',
  serviceName: over.serviceName ?? 'Svc',
  exchangeRate: 13.05,
  fixedFee: 0,
  percentFee: 0,
  minAmount: null,
  maxAmount: null,
  speed: 'minutes',
  speedMinutes: 15,
  payoutMethods: ['bank_transfer'],
  rating: 4,
  ...over,
});

describe('compare()', () => {
  it('follows the spec example (Wise, 2000 SAR, 24 SAR fee, rate 13.05, mid 13.21)', () => {
    const wise = base({ serviceSlug: 'wise', exchangeRate: 13.05, fixedFee: 24 });
    const { results } = compare(2000, 13.21, [wise]);
    const r = results[0];
    expect(r.amountAfterFees).toBe(1976);
    expect(round(r.amountReceived)).toBe(25786.8);
    expect(round(r.idealReceived)).toBe(26420);
    expect(round(r.markupPercent, 2)).toBe(1.21);
    expect(round(r.totalCostPercent, 2)).toBe(2.4);
    expect(r.rank).toBe(1);
  });

  it('ranks by amount received and computes savings vs worst', () => {
    const cheap = base({ serviceSlug: 'cheap', exchangeRate: 13.21, fixedFee: 20 });
    const mid = base({ serviceSlug: 'mid', exchangeRate: 13.0, fixedFee: 10 });
    const bad = base({ serviceSlug: 'bad', exchangeRate: 12.4, fixedFee: 25 });
    const { results } = compare(2000, 13.21, [bad, mid, cheap]);
    expect(results.map((r) => r.service.serviceSlug)).toEqual(['cheap', 'mid', 'bad']);
    expect(results[0].rank).toBe(1);
    expect(results[2].rank).toBe(3);
    expect(results[2].savingsVsWorst).toBe(0);
    expect(results[0].savingsVsWorst).toBeCloseTo(results[0].amountReceived - results[2].amountReceived, 6);
  });

  it('applies percentage fees as fractions', () => {
    const s = base({ percentFee: percentToFraction(0.65), fixedFee: 1 });
    const { results } = compare(1000, 13.21, [s]);
    expect(results[0].totalFees).toBeCloseTo(7.5, 6);
    expect(results[0].amountAfterFees).toBeCloseTo(992.5, 6);
  });

  it('skips services outside min/max or where fees exceed the amount', () => {
    const tooSmall = base({ serviceSlug: 'min', minAmount: 500 });
    const tooBig = base({ serviceSlug: 'max', maxAmount: 100 });
    const eatsAll = base({ serviceSlug: 'fee', fixedFee: 500 });
    const ok = base({ serviceSlug: 'ok' });
    const { results, skipped } = compare(200, 13.21, [tooSmall, tooBig, eatsAll, ok]);
    expect(results.map((r) => r.service.serviceSlug)).toEqual(['ok']);
    expect(skipped.map((s) => `${s.service.serviceSlug}:${s.reason}`)).toEqual([
      'min:below_min',
      'max:above_max',
      'fee:fee_exceeds_amount',
    ]);
  });

  it('splits visible vs hidden cost so they add up to total loss', () => {
    const s = base({ exchangeRate: 12.5, fixedFee: 20, percentFee: 0.01 });
    const { results } = compare(2000, 13.21, [s]);
    const r = results[0];
    expect(r.visibleFeeEgp + r.hiddenFeeEgp).toBeCloseTo(r.totalLoss, 6);
  });

  it('handles an empty service list', () => {
    const { results, skipped } = compare(2000, 13.21, []);
    expect(results).toEqual([]);
    expect(skipped).toEqual([]);
  });

  it('finds the fastest service', () => {
    const slow = base({ serviceSlug: 'slow', speedMinutes: 2000, exchangeRate: 13.2 });
    const fast = base({ serviceSlug: 'fast', speedMinutes: 10, exchangeRate: 12.8 });
    const { results } = compare(1000, 13.21, [slow, fast]);
    expect(findFastest(results)?.service.serviceSlug).toBe('fast');
  });

  it('computes monthly & yearly loss between best and worst', () => {
    const best = base({ serviceSlug: 'wise', exchangeRate: 13.21, fixedFee: 18 });
    const worst = base({ serviceSlug: 'wu', exchangeRate: 12.4, fixedFee: 23 });
    const loss = calculateMonthlyLoss(3000, 13.21, [best, worst]);
    expect(loss).not.toBeNull();
    expect(loss!.best.service.serviceSlug).toBe('wise');
    expect(loss!.yearlyLoss).toBeCloseTo(loss!.monthlyLoss * 12, 6);
    expect(loss!.monthlyLoss).toBeGreaterThan(2000);
  });
});
