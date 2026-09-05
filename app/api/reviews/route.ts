import type { NextRequest } from 'next/server';
import { computeReviewStats, getReviews } from '@/lib/api/content';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabase } from '@/lib/supabase/server';
import { cacheDelete } from '@/lib/exchange/cache';
import { getClientIp } from '@/lib/utils/helpers';
import { badRequest, json, rateLimit, serverError, tooMany, zodErrorResponse } from '@/lib/api/http';
import { reviewSchema } from '@/lib/utils/validators';

export const dynamic = 'force-dynamic';

/** GET /api/reviews?service_id=&corridor_id=&min_rating=&limit= */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  try {
    const reviews = await getReviews({
      serviceId: sp.get('service_id') ?? undefined,
      corridorId: sp.get('corridor_id') ?? undefined,
      minRating: sp.get('min_rating') ? Number(sp.get('min_rating')) : undefined,
      limit: sp.get('limit') ? Number(sp.get('limit')) : undefined,
    });
    return json({ reviews, stats: computeReviewStats(reviews) }, { maxAge: 60 });
  } catch (err) {
    return serverError(err, 'failed to load reviews');
  }
}

/** POST /api/reviews — submit a review (moderated: is_approved=false). Guests allowed. */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers) ?? 'unknown';
  if (!rateLimit(`reviews:${ip}`, 5, 10 * 60_000)) return tooMany();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('invalid JSON');
  }
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);
  const v = parsed.data;

  try {
    const supabase = createServerSupabase();
    const user = supabase ? (await supabase.auth.getUser()).data.user : null;
    const admin = createAdminClient();

    if (!admin) {
      console.info('[hawwely] review (demo, not persisted)', { service: v.service_id, rating: v.rating });
      return json({ ok: true, demo: true }, { status: 202 });
    }

    const row = {
      user_id: user?.id ?? null,
      service_id: v.service_id,
      corridor_id: v.corridor_id || null,
      rating: v.rating,
      title: v.title,
      title_ar: v.title,
      body: v.body,
      body_ar: v.body,
      amount_sent: v.amount_sent || null,
      amount_received: v.amount_received || null,
      send_currency: v.send_currency || null,
      receive_currency: 'EGP',
      reported_rate: v.amount_sent && v.amount_received ? Number(v.amount_received) / Number(v.amount_sent) : null,
      transfer_speed_actual: v.transfer_speed_actual || null,
      would_recommend: v.would_recommend ?? null,
      author_name: v.author_name || null,
      is_verified: false,
      is_approved: false,
    };
    const { error } = await admin.from('reviews').insert(row);
    if (error) throw error;
    cacheDelete('reviews:');
    return json({ ok: true }, { status: 201 });
  } catch (err) {
    return serverError(err, 'failed to submit review');
  }
}
