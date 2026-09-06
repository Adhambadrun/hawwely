import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchMidMarketRates } from '@/lib/exchange/providers';
import { buildRates } from '@/lib/data/rates';
import { cacheDelete } from '@/lib/exchange/cache';
import { CORRIDORS_BY_CURRENCY } from '@/lib/data/corridors';
import type { SendCurrency } from '@/lib/types';

export interface RefreshResult {
  ok: boolean;
  provider: string;
  fetched_at: string;
  mid_market: Record<SendCurrency, number>;
  rates_upserted: number;
  history_inserted: number;
  persisted: boolean;
  note?: string;
}

/**
 * Refresh pipeline used by /api/rates/refresh and /api/cron/update-rates:
 * 1. Fetch mid-market rates (FreeCurrencyAPI → other providers → baseline)
 * 2. Recompute every service's effective rate for every corridor
 * 3. Upsert into `rates`, append to `rate_history`
 * 4. Bust the in-memory caches
 */
export async function refreshRates(): Promise<RefreshResult> {
  const snapshot = await fetchMidMarketRates({ fresh: true });
  const rows = buildRates(snapshot.rates, snapshot.fetchedAt);
  const admin = createAdminClient();

  cacheDelete('rates:');
  cacheDelete('compare:');
  cacheDelete('history:');

  if (!admin) {
    return {
      ok: true,
      provider: snapshot.provider,
      fetched_at: snapshot.fetchedAt,
      mid_market: snapshot.rates,
      rates_upserted: 0,
      history_inserted: 0,
      persisted: false,
      note: 'SUPABASE_SERVICE_ROLE_KEY not configured — computed in memory only (demo mode).',
    };
  }

  // Map seed service/corridor ids -> DB ids by slug/currency (DB may have different UUIDs).
  const [{ data: services }, { data: corridors }] = await Promise.all([
    admin.from('services').select('id, slug'),
    admin.from('corridors').select('id, send_currency'),
  ]);
  const serviceIdBySlug = new Map((services ?? []).map((s: { id: string; slug: string }) => [s.slug, s.id]));
  const corridorIdByCurrency = new Map((corridors ?? []).map((c: { id: string; send_currency: string }) => [c.send_currency, c.id]));

  const { SERVICES_BY_ID } = await import('@/lib/data/services');
  const upserts = rows
    .map((r) => {
      const slug = SERVICES_BY_ID[r.service_id]?.slug;
      const currency = Object.values(CORRIDORS_BY_CURRENCY).find((c) => c.id === r.corridor_id)?.send_currency;
      const service_id = slug ? serviceIdBySlug.get(slug) : undefined;
      const corridor_id = currency ? corridorIdByCurrency.get(currency) : undefined;
      if (!service_id || !corridor_id) return null;
      return {
        service_id,
        corridor_id,
        exchange_rate: r.exchange_rate,
        mid_market_rate: r.mid_market_rate,
        markup_percent: r.markup_percent,
        fixed_fee: r.fixed_fee,
        fee_currency: r.fee_currency,
        percent_fee: r.percent_fee,
        min_send_amount: r.min_send_amount,
        max_send_amount: r.max_send_amount,
        transfer_speed: r.transfer_speed,
        transfer_speed_minutes: r.transfer_speed_minutes,
        payout_method: r.payout_method,
        promo_active: r.promo_active,
        promo_text: r.promo_text,
        promo_text_ar: r.promo_text_ar,
        last_verified_at: snapshot.fetchedAt,
        verified_by: 'system',
        source: snapshot.provider === 'baseline' ? 'manual' : 'api',
        is_active: true,
        updated_at: snapshot.fetchedAt,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const { error: upsertError } = await admin.from('rates').upsert(upserts, { onConflict: 'service_id,corridor_id' });
  if (upsertError) throw new Error(`rates upsert failed: ${upsertError.message}`);

  const history = upserts.map((u) => ({
    service_id: u.service_id,
    corridor_id: u.corridor_id,
    exchange_rate: u.exchange_rate,
    mid_market_rate: u.mid_market_rate,
    recorded_at: snapshot.fetchedAt,
  }));
  const { error: historyError } = await admin.from('rate_history').insert(history);
  if (historyError) throw new Error(`rate_history insert failed: ${historyError.message}`);

  return {
    ok: true,
    provider: snapshot.provider,
    fetched_at: snapshot.fetchedAt,
    mid_market: snapshot.rates,
    rates_upserted: upserts.length,
    history_inserted: history.length,
    persisted: true,
  };
}
