import type { NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { badRequest, json, serverError, unauthorized, zodErrorResponse } from '@/lib/api/http';
import { alertSchema } from '@/lib/utils/validators';

export const dynamic = 'force-dynamic';

/** GET /api/alerts — current user's alerts (RLS enforced). */
export async function GET() {
  const supabase = createServerSupabase();
  if (!supabase) return json({ alerts: [], demo: true });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const { data, error } = await supabase
    .from('rate_alerts')
    .select('*, corridor:corridors(send_currency, flag_emoji, send_country, send_country_ar)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) return serverError(error);
  return json({ alerts: data ?? [] });
}

/** POST /api/alerts — create an alert. */
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  if (!supabase) return json({ ok: true, demo: true, alert: null }, { status: 202 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('invalid JSON');
  }
  const parsed = alertSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  // Ensure a profile row exists (first login).
  await supabase.from('profiles').upsert({ id: user.id, email: user.email }, { onConflict: 'id', ignoreDuplicates: true });

  const { data, error } = await supabase
    .from('rate_alerts')
    .insert({ ...parsed.data, user_id: user.id })
    .select('*, corridor:corridors(send_currency, flag_emoji, send_country, send_country_ar)')
    .single();
  if (error) return serverError(error);
  return json({ ok: true, alert: data }, { status: 201 });
}

/** DELETE /api/alerts?id=<uuid> */
export async function DELETE(request: NextRequest) {
  const supabase = createServerSupabase();
  if (!supabase) return json({ ok: true, demo: true });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return badRequest('missing id');
  const { error } = await supabase.from('rate_alerts').delete().eq('id', id).eq('user_id', user.id);
  if (error) return serverError(error);
  return json({ ok: true });
}
