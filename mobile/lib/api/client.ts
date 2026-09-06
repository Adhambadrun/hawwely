/**
 * Data layer for the mobile app.
 *
 * Strategy (per request):
 *   1. Try the website API (`EXPO_PUBLIC_API_URL/api/...`) — same comparison
 *      engine and live rates as hawwely.com.
 *   2. On failure (offline / server down) fall back to the last cached response.
 *   3. If nothing is cached, compute locally with the shared engine + seed data
 *      so the app is ALWAYS usable ("demo" source).
 */
import { APP_URL, DEFAULT_AMOUNT } from '@/lib/shared/constants';
import { compare, findBestRated, findFastest, percentToFraction, round, type ServiceRate } from '@/lib/shared/calculator';
import { CORRIDORS, BASELINE_MID_MARKET } from '@/lib/shared/data/corridors';
import { SERVICES } from '@/lib/shared/data/services';
import { DEMO_RATES } from '@/lib/shared/data/rates';
import { buildDemoHistory, historyStats, windowChange, type HistoryStats } from '@/lib/shared/data/history';
import { FAQS } from '@/lib/shared/data/faqs';
import { BLOG_POSTS } from '@/lib/shared/data/blog';
import { REVIEWS } from '@/lib/shared/data/reviews';
import type { BlogPost, ComparisonResponse, ComparisonResultItem, Corridor, Faq, PayoutMethod, RateHistoryPoint, Review, SendCurrency, Service } from '@/lib/shared/types';
import { cacheGet, cacheSet } from '@/lib/utils/storage';

export type Source = 'live' | 'cache' | 'demo';

export interface CorridorRateRow {
  currency: SendCurrency;
  country: string;
  country_ar: string;
  flag: string;
  corridor_id: string;
  mid_market_rate: number;
  best_rate: number;
  best_service_slug: string | null;
  best_service_name: string | null;
  best_service_name_ar: string | null;
  change_24h_percent: number;
  high_24h: number;
  low_24h: number;
  services_count: number;
}

export interface RatesSnapshot {
  rates: CorridorRateRow[];
  updated_at: string;
  source: Source;
}

export interface HistoryResponse {
  corridor: { id: string; currency: SendCurrency };
  service: { id: string; slug: string; name: string; name_ar: string } | null;
  days: number;
  points: RateHistoryPoint[];
  stats: HistoryStats | null;
  change: { abs: number; percent: number };
  source: Source;
}

const TIMEOUT_MS = 12_000;

async function http<T>(path: string, init?: RequestInit & { timeoutMs?: number }): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), init?.timeoutMs ?? TIMEOUT_MS);
  try {
    const res = await fetch(`${APP_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Hawwely-Client': 'mobile', ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      throw new ApiError(body.error ?? body.message ?? `HTTP ${res.status}`, res.status);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Live → cache → local fallback. */
async function withFallback<T>(cacheKey: string, live: () => Promise<T>, local: () => T, tag: (v: T, s: Source) => T): Promise<T> {
  try {
    const value = await live();
    void cacheSet(cacheKey, value);
    return tag(value, 'live');
  } catch (err) {
    const cached = await cacheGet<T>(cacheKey);
    if (cached) return tag(cached.value, 'cache');
    if (err instanceof ApiError && err.status >= 400 && err.status < 500) throw err;
    return tag(local(), 'demo');
  }
}

// ---------------------------------------------------------------------------
// Catalogue (bundled, instant)
// ---------------------------------------------------------------------------
export function getCorridors(): Corridor[] {
  return [...CORRIDORS].filter((c) => c.is_active).sort((a, b) => a.popularity_rank - b.popularity_rank);
}
export function getCorridorByCurrency(currency: string): Corridor | undefined {
  return CORRIDORS.find((c) => c.send_currency === currency.toUpperCase());
}
export function getCorridorById(id: string): Corridor | undefined {
  return CORRIDORS.find((c) => c.id === id);
}
export function getServices(): Service[] {
  return [...SERVICES].filter((s) => s.is_active).sort((a, b) => a.priority_order - b.priority_order);
}
export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
export function getServiceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}
export function getFaqs(opts: { corridorId?: string; serviceId?: string } = {}): Faq[] {
  return FAQS.filter((f) => f.is_active)
    .filter((f) => (opts.corridorId ? f.corridor_id === opts.corridorId || f.corridor_id === null : true))
    .filter((f) => (opts.serviceId ? f.service_id === opts.serviceId || f.service_id === null : true))
    .sort((a, b) => a.sort_order - b.sort_order);
}

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------
export function compareLocally(currency: SendCurrency, amount: number, payout?: PayoutMethod | null): ComparisonResponse | null {
  const corridor = getCorridorByCurrency(currency);
  if (!corridor) return null;
  const byId = new Map(SERVICES.map((s) => [s.id, s]));
  const rates = DEMO_RATES.filter((r) => r.corridor_id === corridor.id && byId.has(r.service_id)).map((r) => ({ ...r, service: byId.get(r.service_id) as Service }));
  const mid = rates[0]?.mid_market_rate ?? BASELINE_MID_MARKET[corridor.send_currency];
  const eligible = payout ? rates.filter((r) => r.service.payout_methods.includes(payout)) : rates;

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
  const code = `${corridor.send_currency}-EGP` as const;

  const items: ComparisonResultItem[] = results.map((r) => {
    const rate = rateByService.get(r.service.serviceId)!;
    const s = rate.service;
    return {
      service: { id: s.id, name: s.name, name_ar: s.name_ar, slug: s.slug, logo_url: s.logo_url, rating: s.rating, review_count: s.total_reviews, brand_color: s.brand_color, website_url: s.website_url },
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
      affiliate_url: s.website_url,
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
    corridor: { id: corridor.id, code, flag_emoji: corridor.flag_emoji, send_country: corridor.send_country, send_country_ar: corridor.send_country_ar },
    mid_market_rate: mid,
    results: items,
    skipped: skipped.map((s) => {
      const svc = rateByService.get(s.service.serviceId)?.service;
      return { service_slug: s.service.serviceSlug, service_name: svc?.name ?? s.service.serviceName, service_name_ar: svc?.name_ar ?? s.service.serviceName, reason: s.reason, min_amount: s.service.minAmount, max_amount: s.service.maxAmount };
    }),
    summary: {
      cheapest_service: cheapest?.service.slug ?? null,
      fastest_service: fastest?.service.serviceSlug ?? null,
      best_rated_service: bestRated?.service.serviceSlug ?? null,
      max_savings: cheapest && worst ? round(cheapest.amount_received - worst.amount_received) : 0,
      max_savings_currency: 'EGP',
      worst_service: worst?.service.slug ?? null,
      services_compared: items.length,
      last_updated: new Date().toISOString(),
      source: 'demo',
    },
  };
}

export type ComparisonWithSource = ComparisonResponse & { source: Source };

export async function fetchComparison(currency: SendCurrency, amount: number, payout?: PayoutMethod | null): Promise<ComparisonWithSource> {
  const key = `compare:${currency}:${amount}:${payout ?? 'any'}`;
  const qs = new URLSearchParams({ from: currency, to: 'EGP', amount: String(amount) });
  if (payout) qs.set('payout', payout);
  return withFallback<ComparisonWithSource>(
    key,
    async () => ({ ...(await http<ComparisonResponse>(`/api/rates/compare?${qs.toString()}`)), source: 'live' }),
    () => {
      const local = compareLocally(currency, amount, payout);
      if (!local) throw new ApiError('corridor not found', 404);
      return { ...local, source: 'demo' };
    },
    (v, s) => ({ ...v, source: s }),
  );
}

// ---------------------------------------------------------------------------
// Rates snapshot + history
// ---------------------------------------------------------------------------
export function ratesLocally(): RatesSnapshot {
  const rows: CorridorRateRow[] = getCorridors().map((c) => {
    const rates = DEMO_RATES.filter((r) => r.corridor_id === c.id);
    const mid = BASELINE_MID_MARKET[c.send_currency];
    const best = rates.reduce<(typeof rates)[number] | null>((b, r) => (b == null || r.exchange_rate > b.exchange_rate ? r : b), null);
    const svc = best ? SERVICES.find((s) => s.id === best.service_id) : undefined;
    const hist = buildDemoHistory(c.send_currency, 2, mid, 0, 24).slice(-25);
    const first = hist[0]?.mid_market_rate ?? mid;
    return {
      currency: c.send_currency,
      country: c.send_country,
      country_ar: c.send_country_ar,
      flag: c.flag_emoji,
      corridor_id: c.id,
      mid_market_rate: mid,
      best_rate: best?.exchange_rate ?? mid,
      best_service_slug: svc?.slug ?? null,
      best_service_name: svc?.name ?? null,
      best_service_name_ar: svc?.name_ar ?? null,
      change_24h_percent: first ? round(((mid - first) / first) * 100) : 0,
      high_24h: Math.max(...hist.map((p) => p.mid_market_rate)),
      low_24h: Math.min(...hist.map((p) => p.mid_market_rate)),
      services_count: rates.length,
    };
  });
  return { rates: rows, updated_at: new Date().toISOString(), source: 'demo' };
}

export async function fetchRates(): Promise<RatesSnapshot> {
  return withFallback<RatesSnapshot>('rates:all', () => http<RatesSnapshot>('/api/rates'), ratesLocally, (v, s) => ({ ...v, source: s }));
}

export async function fetchHistory(currency: SendCurrency, days: 7 | 30 | 90, serviceSlug?: string): Promise<HistoryResponse> {
  const key = `history:${currency}:${days}:${serviceSlug ?? 'mid'}`;
  const qs = new URLSearchParams({ from: currency, days: String(days) });
  if (serviceSlug) qs.set('service', serviceSlug);
  return withFallback<HistoryResponse>(
    key,
    () => http<HistoryResponse>(`/api/rates/history?${qs.toString()}`),
    () => {
      const corridor = getCorridorByCurrency(currency);
      const service = serviceSlug ? getServiceBySlug(serviceSlug) : undefined;
      const rate = service ? DEMO_RATES.find((r) => r.service_id === service.id && r.corridor_id === corridor?.id) : undefined;
      const points = buildDemoHistory(currency, days, BASELINE_MID_MARKET[currency], rate?.markup_percent ?? 0, days <= 7 ? 4 : 1);
      const k = service ? 'exchange_rate' : 'mid_market_rate';
      return {
        corridor: { id: corridor?.id ?? '', currency },
        service: service ? { id: service.id, slug: service.slug, name: service.name, name_ar: service.name_ar } : null,
        days,
        points,
        stats: historyStats(points, k),
        change: windowChange(points, k),
        source: 'demo',
      };
    },
    (v, s) => ({ ...v, source: s }),
  );
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------
export interface ReviewsResponse {
  reviews: Review[];
  stats: { average: number; total: number; distribution: Record<1 | 2 | 3 | 4 | 5, number>; recommend_percent: number };
  source: Source;
}

function statsFor(list: Review[]): ReviewsResponse['stats'] {
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of list) distribution[Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5] += 1;
  const total = list.length;
  const average = total ? round(list.reduce((a, r) => a + r.rating, 0) / total, 1) : 0;
  const rec = list.filter((r) => r.would_recommend != null);
  const recommend_percent = rec.length ? Math.round((rec.filter((r) => r.would_recommend).length / rec.length) * 100) : 0;
  return { average, total, distribution, recommend_percent };
}

export async function fetchReviews(opts: { serviceId?: string; corridorId?: string; limit?: number } = {}): Promise<ReviewsResponse> {
  const qs = new URLSearchParams();
  if (opts.serviceId) qs.set('service_id', opts.serviceId);
  if (opts.corridorId) qs.set('corridor_id', opts.corridorId);
  qs.set('limit', String(opts.limit ?? 50));
  const key = `reviews:${qs.toString()}`;
  return withFallback<ReviewsResponse>(
    key,
    () => http<ReviewsResponse>(`/api/reviews?${qs.toString()}`),
    () => {
      const list = REVIEWS.filter((r) => r.is_approved)
        .filter((r) => (opts.serviceId ? r.service_id === opts.serviceId : true))
        .filter((r) => (opts.corridorId ? r.corridor_id === opts.corridorId : true))
        .slice(0, opts.limit ?? 50);
      return { reviews: list, stats: statsFor(list), source: 'demo' };
    },
    (v, s) => ({ ...v, source: s }),
  );
}

export function getBlogPosts(category?: string): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.is_published)
    .filter((p) => (category && category !== 'all' ? p.category === category : true))
    .sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''));
}
export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

// ---------------------------------------------------------------------------
// Writes (always go to the website API — it owns the service-role key)
// ---------------------------------------------------------------------------
export interface ClickResponse {
  ok: boolean;
  url: string | null;
  service?: string;
}

export async function trackClick(body: { service_id: string; corridor_id?: string | null; amount?: number | null; session_id: string }): Promise<ClickResponse> {
  return http<ClickResponse>('/api/clicks', { method: 'POST', body: JSON.stringify(body), timeoutMs: 6000 });
}

export async function submitReview(body: Record<string, unknown>): Promise<{ ok: boolean; demo?: boolean }> {
  return http('/api/reviews', { method: 'POST', body: JSON.stringify(body) });
}

export async function submitReport(body: Record<string, unknown>): Promise<{ ok: boolean; demo?: boolean }> {
  return http('/api/reports', { method: 'POST', body: JSON.stringify(body) });
}

export async function subscribe(body: { email: string; name?: string; country_code?: string; preferred_corridor?: string }): Promise<{ ok: boolean }> {
  return http('/api/subscribe', { method: 'POST', body: JSON.stringify(body) });
}

export { DEFAULT_AMOUNT };
