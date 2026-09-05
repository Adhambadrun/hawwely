import { checkAlerts } from '@/lib/api/alerts';
import { isCronAuthorized, json, serverError, unauthorized } from '@/lib/api/http';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** POST /api/alerts/check — evaluate & trigger alerts (protected). */
export async function POST(request: Request) {
  if (!isCronAuthorized(request)) return unauthorized();
  try {
    return json(await checkAlerts());
  } catch (err) {
    return serverError(err, 'alert check failed');
  }
}
