import type { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getClientIp } from '@/lib/utils/helpers';
import { badRequest, json, rateLimit, serverError, tooMany, zodErrorResponse } from '@/lib/api/http';
import { contactSchema } from '@/lib/utils/validators';

export const dynamic = 'force-dynamic';

/** POST /api/contact — stores the message in `contact_messages` (best effort) and logs it. */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers) ?? 'unknown';
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60_000)) return tooMany();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('invalid JSON');
  }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  try {
    const admin = createAdminClient();
    if (admin) {
      const { error } = await admin.from('contact_messages').insert({ ...parsed.data, ip_address: ip });
      if (error) console.warn('[hawwely] contact insert failed:', error.message);
    } else {
      console.info('[hawwely] contact message (demo)', parsed.data);
    }
    return json({ ok: true });
  } catch (err) {
    return serverError(err, 'failed to send message');
  }
}
