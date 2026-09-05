import type { NextRequest } from 'next/server';
import { getRateHistory } from '@/lib/api/rates';
import { resolveCorridor } from '@/lib/api/corridors';
import { getServiceBySlug } from '@/lib/api/services';
import { historyStats, windowChange } from '@/lib/data/history';
import { badRequest, json, notFound, serverError } from '@/lib/api/http';

export const dynamic = 'force-dynamic';

/**
 * GET /api/rates/history?from=SAR&days=30[&service=wise]
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const from = sp.get('from');
  const days = Math.min(365, Math.max(1, Number(sp.get('days') ?? 30) || 30));
  const serviceSlug = sp.get('service');
  if (!from) return badRequest('missing "from"');

  try {
    const corridor = await resolveCorridor(from);
    if (!corridor) return notFound('corridor not found');
    const service = serviceSlug ? await getServiceBySlug(serviceSlug) : null;
    if (serviceSlug && !service) return notFound('service not found');

    const pointsPerDay = days <= 2 ? 24 : days <= 7 ? 4 : 1;
    const points = await getRateHistory(corridor, days, service?.id, pointsPerDay);
    return json(
      {
        corridor: { id: corridor.id, currency: corridor.send_currency, flag: corridor.flag_emoji },
        service: service ? { id: service.id, slug: service.slug, name: service.name, name_ar: service.name_ar } : null,
        days,
        points,
        stats: historyStats(points, service ? 'exchange_rate' : 'mid_market_rate'),
        change: windowChange(points, service ? 'exchange_rate' : 'mid_market_rate'),
      },
      { maxAge: 600 },
    );
  } catch (err) {
    return serverError(err, 'failed to load history');
  }
}
