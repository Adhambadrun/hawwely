import type { SendCurrency } from '@/lib/types';
import { SEND_CURRENCIES } from '@/lib/utils/constants';
import { BASELINE_MID_MARKET } from '@/lib/data/corridors';

/**
 * Mid-market FX providers. Each returns EGP per 1 unit of every send currency.
 * They are tried in order; the first that succeeds wins. When all fail we fall
 * back to the baseline table so the site never shows an empty comparison.
 */

export interface MidMarketSnapshot {
  rates: Record<SendCurrency, number>;
  provider: string;
  fetchedAt: string;
}

type Provider = {
  name: string;
  enabled: () => boolean;
  fetch: (fresh: boolean) => Promise<Record<string, number>>; // returns EGP per 1 unit for arbitrary currency codes
};

const TIMEOUT_MS = 8000;

async function fetchJson<T>(url: string, fresh: boolean): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // `revalidate` keeps pages ISR-cacheable; the cron job passes fresh=true to bypass the data cache.
    const res = await fetch(url, fresh ? { signal: controller.signal, cache: 'no-store' } : { signal: controller.signal, next: { revalidate: 1800 } });
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Convert a USD-based table (units of currency per 1 USD) to EGP per 1 unit of each currency. */
function usdTableToEgp(perUsd: Record<string, number>): Record<string, number> {
  const egpPerUsd = perUsd.EGP;
  if (!egpPerUsd) throw new Error('Provider response is missing EGP');
  const out: Record<string, number> = {};
  for (const cur of SEND_CURRENCIES) {
    const unitsPerUsd = cur === 'USD' ? 1 : perUsd[cur];
    if (!unitsPerUsd) continue;
    out[cur] = egpPerUsd / unitsPerUsd;
  }
  return out;
}

const providers: Provider[] = [
  {
    name: 'freecurrencyapi',
    enabled: () => Boolean(process.env.FREE_CURRENCY_API_KEY),
    fetch: async (fresh) => {
      const data = await fetchJson<{ data: Record<string, number> }>(
        `https://api.freecurrencyapi.com/v1/latest?apikey=${process.env.FREE_CURRENCY_API_KEY}&base_currency=USD&currencies=EGP,${SEND_CURRENCIES.join(',')}`,
        fresh,
      );
      return usdTableToEgp(data.data);
    },
  },
  {
    name: 'exchangerate-api',
    enabled: () => Boolean(process.env.EXCHANGE_RATE_API_KEY),
    fetch: async (fresh) => {
      const data = await fetchJson<{ conversion_rates: Record<string, number> }>(
        `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/USD`,
        fresh,
      );
      return usdTableToEgp(data.conversion_rates);
    },
  },
  {
    name: 'openexchangerates',
    enabled: () => Boolean(process.env.OPEN_EXCHANGE_RATES_KEY),
    fetch: async (fresh) => {
      const data = await fetchJson<{ rates: Record<string, number> }>(
        `https://openexchangerates.org/api/latest.json?app_id=${process.env.OPEN_EXCHANGE_RATES_KEY}&base=USD`,
        fresh,
      );
      return usdTableToEgp(data.rates);
    },
  },
  {
    // Keyless public endpoint — last resort before the baseline table.
    name: 'open.er-api.com',
    enabled: () => true,
    fetch: async (fresh) => {
      const data = await fetchJson<{ result: string; rates: Record<string, number> }>('https://open.er-api.com/v6/latest/USD', fresh);
      if (data.result !== 'success') throw new Error('open.er-api.com returned an error');
      return usdTableToEgp(data.rates);
    },
  },
];

/** Fetch mid-market rates from the first working provider; falls back to baseline. */
export async function fetchMidMarketRates(opts: { fresh?: boolean } = {}): Promise<MidMarketSnapshot> {
  const errors: string[] = [];
  const fresh = opts.fresh ?? false;

  for (const provider of providers) {
    if (!provider.enabled()) continue;
    try {
      const table = await provider.fetch(fresh);
      const rates = { ...BASELINE_MID_MARKET };
      let filled = 0;
      for (const cur of SEND_CURRENCIES) {
        const v = table[cur];
        if (v && Number.isFinite(v) && v > 0) {
          rates[cur] = Math.round(v * 10000) / 10000;
          filled++;
        }
      }
      if (filled === 0) throw new Error('no usable rates');
      return { rates, provider: provider.name, fetchedAt: new Date().toISOString() };
    } catch (err) {
      errors.push(`${provider.name}: ${(err as Error).message}`);
    }
  }

  if (errors.length) console.warn('[hawwely] all FX providers failed, using baseline:', errors.join(' | '));
  return { rates: { ...BASELINE_MID_MARKET }, provider: 'baseline', fetchedAt: new Date().toISOString() };
}
