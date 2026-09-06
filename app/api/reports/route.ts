import type { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabase } from '@/lib/supabase/server';
import { getClientIp } from '@/lib/utils/helpers';
import { badRequest, json, rateLimit, serverError, tooMany, zodErrorResponse } from '@/lib/api/http';
import { reportSchema } from '@/lib/utils/validators';

export const dynamic = 'force-dynamic';

/** POST /api/reports — crowdsourced rate report (status=pending). */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers) ?? 'unknown';
  if (!rateLimit(`reports:${ip}`, 10, 10 * 60_000)) return tooMany();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('invalid JSON');
  }
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);
  const v = parsed.data;

  try {
    const supabase = createServerSupabase();
    const user = supabase ? (await supabase.auth.getUser()).data.user : null;
    const admin = createAdminClient();
    if (!admin) {
      console.info('[hawwely] rate report (demo, not persisted)', v);
      return json({ ok: true, demo: true }, { status: 202 });
    }
    const { error } = await admin.from('user_reports').insert({
      user_id: user?.id ?? null,
      service_id: v.service_id,
      corridor_id: v.corridor_id,
      reported_rate: v.reported_rate,
      amount_sent: v.amount_sent || null,
      amount_received: v.amount_received || null,
      fee_charged: v.fee_charged === '' ? null : v.fee_charged ?? null,
      screenshot_url: v.screenshot_url || null,
      status: 'pending',
    });
    if (error) throw error;
    if (user) {
      await admin.rpc('increment_reputation', { p_user_id: user.id, p_points: 5 }).then(({ error: e }) => e && console.warn(e.message));
    }
    return json({ ok: true }, { status: 201 });
  } catch (err) {
    return serverError(err, 'failed to submit report');
  }
}
