import 'server-only';
import type {
  ComparisonResponse,
  ComparisonResultItem,
  Corridor,
  PayoutMethod,
  Rate,
  RateHistoryPoint,
  RateWithService,
  SendCurrency,
  Service,
} from '@/lib/types';
import { buildRates, DEMO_RATES, PRICING_PROFILES } from '@/lib/data/rates';
import { BASELINE_MID_MARKET, CORRIDORS_BY_CURRENCY } from '@/lib/data/corridors';
import { SERVICES_BY_ID } from '@/lib/data/services';
import { buildDemoHistory } from '@/lib/data/history';
import { createPublicClient } from '@/lib/supabase/public';
import { cached, TTL } from '@/lib/exchange/cache';
import { compare, findBestRated, findFastest, percentToFraction, round, type ServiceRate } from '@/lib/exchange/calculator';
import { fetchMidMarketRates } from '@/lib/exchange/providers';
import { buildAffiliateUrl } from '@/lib/utils/affiliate';
import { getCorridorByCurrency, getCorridors } from './corridors';
import { getServices } from './services';

/* ------------------------------------------------------------------ */
/* Rate table access                                                   */
/* ------------------------------------------------------------------ */

/**
 * In demo mode we still try to pull a LIVE mid-market snapshot from a keyless
 * FX API so numbers feel real; if that fails we use the baseline table.
 */
async function getDemoRates(): Promise<{ rates: Rate[]; source: 'live' | 'demo'; updatedAt: string }> {
  return cached('rates:demo', TTL.rates, async () => {
    const snapshot = await fetchMidMarketRates();
    if (snapshot.provider === 'baseline') {
      return { rates: DEMO_RATES, source: 'demo' as const, updatedAt: new Date().toISOString() };
    }
    return { rates: buildRates(snapshot.rates, snapshot.fetchedAt), source: 'live' as const, updatedAt: snapshot.fetchedAt };
  });
}

/** All active rates (every corridor). */
export async function getAllRates(): Promise<{ rates: Rate[]; source: 'live' | 'demo'; updatedAt: string }> {
  const supabase = createPublicClient();
  if (!supabase) return getDemoRates();

  return cached('rates:all', TTL.rates, async () => {
    const { data, error } = await supabase.from('rates').select('*').eq('is_active', true);
    if (error || !data || data.length === 0) {
      if (error) console.warn('[hawwely] rates query failed, using demo rates:', error.message);
      return getDemoRates();
    }
    const rates = (data as Rate[]).map(normalizeRateRow);
    const updatedAt = rates.reduce((max, r) => (r.last_verified_at > max ? r.last_verified_at : max), rates[0].last_verified_at);
    return { rates, source: 'live' as const, updatedAt };
  });
}

function normalizeRateRow(row: Rate): Rate {
  return {
    ...row,
    exchange_rate: Number(row.exchange_rate),
    mid_market_rate: Number(row.mid_market_rate),
    markup_percent: Number(row.markup_percent ?? 0),
    fixed_fee: Number(row.fixed_fee ?? 0),
    percent_fee: Number(row.percent_fee ?? 0),
    min_send_amount: row.min_send_amount == null ? null : Number(row.min_send_amount),
    max_send_amount: row.max_send_amount == null ? null : Number(row.max_send_amount),
    transfer_speed_minutes: Number(row.transfer_speed_minutes ?? 0),
  };
}

export async function getRatesForCorridor(corridor: Corridor): Promise<{ rates: RateWithService[]; source: 'live' | 'demo'; updatedAt: string }> {
  const [{ rates, source, updatedAt }, services] = await Promise.all([getAllRates(), getServices()]);
  const byId = new Map(services.map((s) => [s.id, s]));
  const joined = rates
    .filter((r) => r.corridor_id === corridor.id && byId.has(r.service_id))
    .map((r) => ({ ...r, service: byId.get(r.service_id) as Service }));
  return { rates: joined, source, updatedAt };
}

/** Mid-market rate for a corridor (EGP per 1 unit). */
export async function getMidMarketRate(corridor: Corridor): Promise<number> {
  const { rates } = await getRatesForCorridor(corridor);
  if (rates.length > 0) return rates[0].mid_market_rate;
  return BASELINE_MID_MARKET[corridor.send_currency];
}

/** Snapshot of every corridor: mid-market + best service rate + change vs yesterday. */
export interface CorridorRateSummary {
  corridor: Corridor;
  midMarketRate: number;
  bestRate: number;
  bestServiceSlug: string | null;
  bestServiceName: string | null;
  bestServiceNameAr: string | null;
  change24hPercent: number;
  high24h: number;
  low24h: number;
  servicesCount: number;
  updatedAt: string;
}

export async function getCorridorSummaries(): Promise<{ summaries: CorridorRateSummary[]; source: 'live' | 'demo'; updatedAt: string }> {
  const [corridors, { rates, source, updatedAt }, services] = await Promise.all([getCorridors(), getAllRates(), getServices()]);
  const byId = new Map(services.map((s) => [s.id, s]));

  const summaries: CorridorRateSummary[] = [];
  for (const corridor of corridors) {
    const cr = rates.filter((r) => r.corridor_id === corridor.id && byId.has(r.service_id));
    const mid = cr[0]?.mid_market_rate ?? BASELINE_MID_MARKET[corridor.send_currency];
    const best = cr.reduce<Rate | null>((b, r) => (b == null || r.exchange_rate > b.exchange_rate ? r : b), null);
    const history = await getRateHistory(corridor, 2, undefined, 24);
    const dayPoints = history.slice(-25);
    const first = dayPoints[0]?.mid_market_rate ?? mid;
    const high = dayPoints.length ? Math.max(...dayPoints.map((p) => p.mid_market_rate)) : mid;
    const low = dayPoints.length ? Math.min(...dayPoints.map((p) => p.mid_market_rate)) : mid;
    const bestService = best ? byId.get(best.service_id) ?? null : null;
    summaries.push({
      corridor,
      midMarketRate: mid,
      bestRate: best?.exchange_rate ?? mid,
      bestServiceSlug: bestService?.slug ?? null,
      bestServiceName: bestService?.name ?? null,
      bestServiceNameAr: bestService?.name_ar ?? null,
      change24hPercent: first ? ((mid - first) / first) * 100 : 0,
      high24h: Math.max(high, mid),
      low24h: Math.min(low, mid),
      servicesCount: cr.length,
      updatedAt,
    });
  }
  return { summaries, source, updatedAt };
}

/* ------------------------------------------------------------------ */
/* History                                                             */
/* ------------------------------------------------------------------ */

export async function getRateHistory(
  corridor: Corridor,
  days: number,
  serviceId?: string,
  pointsPerDay = 1,
): Promise<RateHistoryPoint[]> {
  const key = `history:${corridor.id}:${days}:${serviceId ?? 'mid'}:${pointsPerDay}`;
  return cached(key, TTL.history, async () => {
    const supabase = createPublicClient();
    const mid = await getMidMarketRate(corridor);

    if (supabase) {
      const since = new Date(Date.now() - days * 86400 * 1000).toISOString();
      let query = supabase
        .from('rate_history')
        .select('recorded_at, exchange_rate, mid_market_rate, service_id')
        .eq('corridor_id', corridor.id)
        .gte('recorded_at', since)
        .order('recorded_at', { ascending: true })
        .limit(2000);
      if (serviceId) query = query.eq('service_id', serviceId);
      const { data, error } = await query;
      if (!error && data && data.length >= 2) {
        // Collapse to one point per bucket (per hour when pointsPerDay > 1, else per day).
        const bucketMs = (86400 * 1000) / pointsPerDay;
        const buckets = new Map<number, RateHistoryPoint>();
        for (const row of data as RateHistoryPoint[]) {
          const b = Math.floor(new Date(row.recorded_at).getTime() / bucketMs);
          buckets.set(b, {
            recorded_at: row.recorded_at,
            exchange_rate: Number(row.exchange_rate),
            mid_market_rate: Number(row.mid_market_rate),
          });
        }
        return Array.from(buckets.values());
      }
    }

    // Demo / fallback: synthetic series anchored at today's mid-market rate.
    const markup = serviceId ? markupForService(serviceId, corridor.send_currency) : 0;
    return buildDemoHistory(corridor.send_currency, days, mid, markup, pointsPerDay);
  });
}

function markupForService(serviceId: string, currency: SendCurrency): number {
  const corridorId = CORRIDORS_BY_CURRENCY[currency]?.id;
  const seedRate = DEMO_RATES.find((r) => r.service_id === serviceId && r.corridor_id === corridorId);
  if (seedRate) return seedRate.markup_percent;
  const slug = SERVICES_BY_ID[serviceId]?.slug;
  return slug && PRICING_PROFILES[slug] ? PRICING_PROFILES[slug].markupPercent : 0;
}

/* ------------------------------------------------------------------ */
/* Comparison                                                          */
/* ------------------------------------------------------------------ */

export interface CompareOptions {
  payout?: PayoutMethod;
}

export async function compareCorridor(currency: string, amount: number, opts: CompareOptions = {}): Promise<ComparisonResponse | null> {
  const corridor = await getCorridorByCurrency(currency);
  if (!corridor) return null;

  const key = `compare:${corridor.id}:${amount}:${opts.payout ?? 'any'}`;
  return cached(key, TTL.comparison, async () => buildComparison(corridor, amount, opts));
}

async function buildComparison(corridor: Corridor, amount: number, opts: CompareOptions): Promise<ComparisonResponse> {
  const { rates, source, updatedAt } = await getRatesForCorridor(corridor);
  const mid = rates[0]?.mid_market_rate ?? BASELINE_MID_MARKET[corridor.send_currency];

  const eligible = opts.payout ? rates.filter((r) => r.service.payout_methods.includes(opts.payout as PayoutMethod)) : rates;

  const serviceRates: ServiceRate[] = eligible.map((r) => ({
    serviceId: r.service.id,
    serviceSlug: r.service.slug,
    serviceName: r.service.name,
    exchangeRate: r.exchange_rate,
    fixedFee: r.fixed_fee,
    percentFee: percentToFraction(r.percent_fee),
    minAmount: r.min_send_amount,
    maxAmount: r.max_send_amount,
    speed: r.transfer_speed,
    speedMinutes: r.transfer_speed_minutes,
    payoutMethods: r.service.payout_methods,
    rating: r.service.rating,
  }));

  const { results, skipped } = compare(amount, mid, serviceRates);
  const fastest = findFastest(results);
  const bestRated = findBestRated(results);
  const rateByService = new Map(eligible.map((r) => [r.service.id, r]));
  const corridorCode = `${corridor.send_currency}-EGP` as const;

  const items: ComparisonResultItem[] = results.map((r) => {
    const rate = rateByService.get(r.service.serviceId) as RateWithService;
    const s = rate.service;
    return {
      service: {
        id: s.id,
        name: s.name,
        name_ar: s.name_ar,
        slug: s.slug,
        logo_url: s.logo_url,
        rating: s.rating,
        review_count: s.total_reviews,
        brand_color: s.brand_color,
        website_url: s.website_url,
      },
      corridor_id: corridor.id,
      exchange_rate: rate.exchange_rate,
      fixed_fee: rate.fixed_fee,
      fee_currency: rate.fee_currency,
      percent_fee: rate.percent_fee,
      total_fee: round(r.totalFees),
      amount_sent: amount,
      amount_after_fee: round(r.amountAfterFees),
      amount_received: round(r.amountReceived),
      mid_market_received: round(r.idealReceived),
      savings_vs_worst: round(r.savingsVsWorst),
      loss_vs_mid_market: round(r.totalLoss),
      visible_fee_egp: round(r.visibleFeeEgp),
      hidden_fee_egp: round(r.hiddenFeeEgp),
      markup_percent: round(r.markupPercent, 3),
      total_cost_percent: round(r.totalCostPercent, 3),
      transfer_speed: rate.transfer_speed,
      transfer_speed_minutes: rate.transfer_speed_minutes,
      payout_methods: s.payout_methods,
      affiliate_url: buildAffiliateUrl(s, corridorCode),
      promo: rate.promo_active && rate.promo_text ? { text: rate.promo_text, text_ar: rate.promo_text_ar ?? rate.promo_text } : null,
      last_verified_at: rate.last_verified_at,
      rank: r.rank,
      is_cheapest: r.rank === 1,
      is_fastest: fastest?.service.serviceId === s.id,
      is_best_rated: bestRated?.service.serviceId === s.id,
    };
  });

  const cheapest = items[0] ?? null;
  const worst = items[items.length - 1] ?? null;

  return {
    query: { from: corridor.send_currency, to: 'EGP', amount, timestamp: new Date().toISOString() },
    corridor: {
      id: corridor.id,
      code: corridorCode,
      flag_emoji: corridor.flag_emoji,
      send_country: corridor.send_country,
      send_country_ar: corridor.send_country_ar,
    },
    mid_market_rate: mid,
    results: items,
    skipped: skipped.map((s) => {
      const svc = rateByService.get(s.service.serviceId)?.service;
      return {
        service_slug: s.service.serviceSlug,
        service_name: svc?.name ?? s.service.serviceName,
        service_name_ar: svc?.name_ar ?? s.service.serviceName,
        reason: s.reason,
        min_amount: s.service.minAmount,
        max_amount: s.service.maxAmount,
      };
    }),
    summary: {
      cheapest_service: cheapest?.service.slug ?? null,
      fastest_service: fastest?.service.serviceSlug ?? null,
      best_rated_service: bestRated?.service.serviceSlug ?? null,
      max_savings: cheapest && worst ? round(cheapest.amount_received - worst.amount_received) : 0,
      max_savings_currency: 'EGP',
      worst_service: worst?.service.slug ?? null,
      services_compared: items.length,
      last_updated: updatedAt,
      source,
    },
  };
}

/** Convenience for the homepage savings calculator: best vs worst at several amounts. */
export async function getSavingsCurve(currency: string, amounts: number[]) {
  const out: { amount: number; best: number; worst: number; bestName: string; bestNameAr: string; worstName: string; worstNameAr: string }[] = [];
  for (const amount of amounts) {
    const c = await compareCorridor(currency, amount);
    if (!c || c.results.length < 2) continue;
    const best = c.results[0];
    const worst = c.results[c.results.length - 1];
    out.push({
      amount,
      best: best.amount_received,
      worst: worst.amount_received,
      bestName: best.service.name,
      bestNameAr: best.service.name_ar,
      worstName: worst.service.name,
      worstNameAr: worst.service.name_ar,
    });
  }
  return out;
}
