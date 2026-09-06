import type { RateHistoryPoint, SendCurrency } from '@/lib/types';
import { fnv1a, seededRandom } from '@/lib/utils/helpers';
import { BASELINE_MID_MARKET } from './corridors';

/**
 * Deterministic synthetic history for demo mode (no database).
 * Produces a plausible random-walk that ENDS at the current mid-market rate,
 * so charts line up with the live number shown elsewhere on the page.
 */
export function buildDemoHistory(
  currency: SendCurrency,
  days: number,
  endRate: number = BASELINE_MID_MARKET[currency],
  markupPercent = 0,
  pointsPerDay = 1,
): RateHistoryPoint[] {
  const total = Math.max(2, Math.round(days * pointsPerDay));
  const rand = seededRandom(fnv1a(`${currency}:${days}:${markupPercent}`));
  // ~0.35% daily volatility, scaled down for intraday resolution.
  const volatility = 0.0035 / Math.sqrt(pointsPerDay);
  const steps: number[] = [];
  let level = 0;
  for (let i = 0; i < total; i++) {
    level += (rand() - 0.5) * 2 * volatility + (Math.sin(i / (6 * pointsPerDay)) * 0.0006) / pointsPerDay;
    steps.push(level);
  }
  // Anchor the last point at 0 so the series ends exactly at endRate.
  const last = steps[steps.length - 1];
  const now = Date.now();
  const stepMs = (24 * 60 * 60 * 1000) / pointsPerDay;

  return steps.map((s, i) => {
    const mid = endRate * (1 + (s - last));
    const recordedAt = new Date(now - (total - 1 - i) * stepMs);
    return {
      recorded_at: recordedAt.toISOString(),
      mid_market_rate: Math.round(mid * 10000) / 10000,
      exchange_rate: Math.round(mid * (1 - markupPercent / 100) * 10000) / 10000,
    };
  });
}

export interface HistoryStats {
  current: number;
  previous: number;
  changeAbs: number;
  changePercent: number;
  high: number;
  low: number;
  average: number;
}

export function historyStats(points: RateHistoryPoint[], key: 'mid_market_rate' | 'exchange_rate' = 'mid_market_rate'): HistoryStats | null {
  if (points.length === 0) return null;
  const values = points.map((p) => p[key]);
  const current = values[values.length - 1];
  const previous = values.length > 1 ? values[values.length - 2] : current;
  const high = Math.max(...values);
  const low = Math.min(...values);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const changeAbs = current - previous;
  const changePercent = previous ? (changeAbs / previous) * 100 : 0;
  return { current, previous, changeAbs, changePercent, high, low, average };
}

/** Change over the whole window (first -> last), used for "7d change" badges. */
export function windowChange(points: RateHistoryPoint[], key: 'mid_market_rate' | 'exchange_rate' = 'mid_market_rate'): { abs: number; percent: number } {
  if (points.length < 2) return { abs: 0, percent: 0 };
  const first = points[0][key];
  const last = points[points.length - 1][key];
  return { abs: last - first, percent: first ? ((last - first) / first) * 100 : 0 };
}
