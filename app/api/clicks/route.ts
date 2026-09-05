import type { NextRequest } from 'next/server';
import { getServiceById } from '@/lib/api/services';
import { getCorridorById } from '@/lib/api/corridors';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabase } from '@/lib/supabase/server';
import { buildAffiliateUrl } from '@/lib/utils/affiliate';
import { getClientIp } from '@/lib/utils/helpers';
import { badRequest, json, notFound, rateLimit, serverError, tooMany, zodErrorResponse } from '@/lib/api/http';
import { clickSchema } from '@/lib/utils/validators';

export const dynamic = 'force-dynamic';

/**
 * POST /api/clicks
 * Body: { service_id, corridor_id?, amount?, session_id? }
 * Logs the affiliate click and returns the tracked outbound URL.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers) ?? 'unknown';
  if (!rateLimit(`clicks:${ip}`, 60, 60_000)) return tooMany();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('invalid JSON');
  }
  const parsed = clickSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  try {
    const [service, corridor] = await Promise.all([
      getServiceById(parsed.data.service_id),
      parsed.data.corridor_id ? getCorridorById(parsed.data.corridor_id) : Promise.resolve(null),
    ]);
    if (!service) return notFound('service not found');

    const url = buildAffiliateUrl(service, corridor ? `${corridor.send_currency}-EGP` : null);

    // Persist (best effort). Prefer service role so anonymous clicks are accepted regardless of RLS.
    const admin = createAdminClient();
    if (admin) {
      let userId: string | null = null;
      try {
        const supabase = createServerSupabase();
        const user = supabase ? (await supabase.auth.getUser()).data.user : null;
        userId = user?.id ?? null;
      } catch {
        /* anonymous */
      }
      const { error } = await admin.from('affiliate_clicks').insert({
        service_id: service.id,
        corridor_id: corridor?.id ?? null,
        user_id: userId,
        session_id: parsed.data.session_id ?? null,
        ip_address: ip,
        user_agent: request.headers.get('user-agent')?.slice(0, 500) ?? null,
        referrer: request.headers.get('referer')?.slice(0, 500) ?? null,
        amount_compared: parsed.data.amount ?? null,
      });
      if (error) console.warn('[hawwely] click insert failed:', error.message);
    } else {
      console.info('[hawwely] click (demo, not persisted)', { service: service.slug, corridor: corridor?.send_currency, amount: parsed.data.amount });
    }

    return json({ ok: true, url, service: service.slug });
  } catch (err) {
    return serverError(err, 'failed to track click');
  }
}
