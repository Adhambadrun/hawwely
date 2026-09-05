import 'server-only';
import type { Corridor, SendCurrency } from '@/lib/types';
import { CORRIDORS, CORRIDORS_BY_CURRENCY } from '@/lib/data/corridors';
import { createPublicClient } from '@/lib/supabase/public';
import { cached, TTL } from '@/lib/exchange/cache';
import { corridorSlugToCode } from '@/lib/utils/constants';

function mergeSeed(row: Partial<Corridor> & { send_currency: string }): Corridor {
  const seed = CORRIDORS_BY_CURRENCY[row.send_currency as SendCurrency];
  return {
    ...(seed ?? {}),
    ...row,
    currency_name: seed?.currency_name,
    currency_name_ar: seed?.currency_name_ar,
    currency_symbol: seed?.currency_symbol,
  } as Corridor;
}

export async function getCorridors(): Promise<Corridor[]> {
  return cached('corridors:all', TTL.catalog, async () => {
    const supabase = createPublicClient();
    if (!supabase) return CORRIDORS.filter((c) => c.is_active).sort((a, b) => a.popularity_rank - b.popularity_rank);

    const { data, error } = await supabase.from('corridors').select('*').eq('is_active', true).order('popularity_rank');
    if (error || !data || data.length === 0) {
      if (error) console.warn('[hawwely] corridors query failed, using seed:', error.message);
      return CORRIDORS.filter((c) => c.is_active);
    }
    return (data as (Partial<Corridor> & { send_currency: string })[]).map(mergeSeed);
  });
}

export async function getCorridorByCurrency(currency: string): Promise<Corridor | null> {
  const corridors = await getCorridors();
  const upper = currency.toUpperCase();
  return corridors.find((c) => c.send_currency === upper) ?? null;
}

/** Accepts "sar-to-egp", "SAR-EGP" or "SAR". */
export async function resolveCorridor(input: string): Promise<Corridor | null> {
  const trimmed = input.trim();
  const fromSlug = corridorSlugToCode(trimmed);
  if (fromSlug) return getCorridorByCurrency(fromSlug.split('-')[0]);
  const m = /^([A-Za-z]{3})(?:-EGP)?$/.exec(trimmed);
  if (m) return getCorridorByCurrency(m[1]);
  return null;
}

export async function getCorridorById(id: string): Promise<Corridor | null> {
  const corridors = await getCorridors();
  return corridors.find((c) => c.id === id) ?? null;
}

export async function getPopularCorridors(limit = 8): Promise<Corridor[]> {
  const corridors = await getCorridors();
  return corridors.slice(0, limit);
}
