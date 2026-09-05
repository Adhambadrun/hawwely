import { refreshRates } from '@/lib/api/refresh';
import { isCronAuthorized, json, serverError, unauthorized } from '@/lib/api/http';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Vercel Cron entry point (GET). Schedule in vercel.json: every 30 minutes. */
export async function GET(request: Request) {
  if (!isCronAuthorized(request)) return unauthorized();
  try {
    const result = await refreshRates();
    return json(result);
  } catch (err) {
    return serverError(err, 'cron update-rates failed');
  }
}
