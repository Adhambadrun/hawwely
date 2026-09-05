import type { NextRequest } from 'next/server';
import { getCorridorSummaries, getRatesForCorridor } from '@/lib/api/rates';
import { resolveCorridor } from '@/lib/api/corridors';
import { json, notFound, serverError } from '@/lib/api/http';

export const dynamic = 'force-dynamic';

/**
 * GET /api/rates            -> snapshot of every corridor (mid-market, best service, 24h change)
 * GET /api/rates?from=SAR   -> all service rates for one corridor
 */
export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get('from');
  try {
    if (from) {
      const corridor = await resolveCorridor(from);
      if (!corridor) return notFound('corridor not found');
      const { rates, source, updatedAt } = await getRatesForCorridor(corridor);
      return json(
        {
          corridor: { id: corridor.id, currency: corridor.send_currency, flag: corridor.flag_emoji },
          mid_market_rate: rates[0]?.mid_market_rate ?? null,
          rates: rates.map((r) => ({
            service: { id: r.service.id, slug: r.service.slug, name: r.service.name, name_ar: r.service.name_ar, logo_url: r.service.logo_url },
            exchange_rate: r.exchange_rate,
            markup_percent: r.markup_percent,
            fixed_fee: r.fixed_fee,
            percent_fee: r.percent_fee,
            fee_currency: r.fee_currency,
            transfer_speed: r.transfer_speed,
            payout_method: r.payout_method,
            last_verified_at: r.last_verified_at,
          })),
          updated_at: updatedAt,
          source,
        },
        { maxAge: 300 },
      );
    }

    const { summaries, source, updatedAt } = await getCorridorSummaries();
    return json(
      {
        rates: summaries.map((s) => ({
          currency: s.corridor.send_currency,
          country: s.corridor.send_country,
          country_ar: s.corridor.send_country_ar,
          flag: s.corridor.flag_emoji,
          corridor_id: s.corridor.id,
          mid_market_rate: s.midMarketRate,
          best_rate: s.bestRate,
          best_service_slug: s.bestServiceSlug,
          best_service_name: s.bestServiceName,
          best_service_name_ar: s.bestServiceNameAr,
          change_24h_percent: Math.round(s.change24hPercent * 100) / 100,
          high_24h: s.high24h,
          low_24h: s.low24h,
          services_count: s.servicesCount,
        })),
        updated_at: updatedAt,
        source,
      },
      { maxAge: 300 },
    );
  } catch (err) {
    return serverError(err, 'failed to load rates');
  }
}
