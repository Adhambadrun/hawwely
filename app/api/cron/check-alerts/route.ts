import { checkAlerts } from '@/lib/api/alerts';
import { isCronAuthorized, json, serverError, unauthorized } from '@/lib/api/http';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Vercel Cron entry point (GET) — runs after update-rates. */
export async function GET(request: Request) {
  if (!isCronAuthorized(request)) return unauthorized();
  try {
    return json(await checkAlerts());
  } catch (err) {
    return serverError(err, 'cron check-alerts failed');
  }
}
