import { refreshRates } from '@/lib/api/refresh';
import { isCronAuthorized, json, serverError, unauthorized } from '@/lib/api/http';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** POST /api/rates/refresh — protected by CRON_SECRET (Authorization: Bearer <secret>). */
export async function POST(request: Request) {
  if (!isCronAuthorized(request)) return unauthorized();
  try {
    const result = await refreshRates();
    return json(result);
  } catch (err) {
    return serverError(err, 'refresh failed');
  }
}
