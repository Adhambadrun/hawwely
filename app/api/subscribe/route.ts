import type { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getClientIp } from '@/lib/utils/helpers';
import { badRequest, json, rateLimit, serverError, tooMany, zodErrorResponse } from '@/lib/api/http';
import { subscribeSchema } from '@/lib/utils/validators';

export const dynamic = 'force-dynamic';

/** POST /api/subscribe — newsletter signup (idempotent on email). */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers) ?? 'unknown';
  if (!rateLimit(`subscribe:${ip}`, 5, 60_000)) return tooMany();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('invalid JSON');
  }
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  try {
    const admin = createAdminClient();
    if (!admin) {
      console.info('[hawwely] subscribe (demo, not persisted)', parsed.data.email);
      return json({ ok: true, demo: true });
    }
    const { error } = await admin.from('subscribers').upsert(
      {
        email: parsed.data.email,
        name: parsed.data.name || null,
        country_code: parsed.data.country_code || null,
        preferred_corridor: parsed.data.preferred_corridor || null,
        is_active: true,
      },
      { onConflict: 'email' },
    );
    if (error) throw error;
    return json({ ok: true });
  } catch (err) {
    return serverError(err, 'subscription failed');
  }
}
