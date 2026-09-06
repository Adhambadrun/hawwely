import type { NextRequest } from 'next/server';
import { compareCorridor } from '@/lib/api/rates';
import { badRequest, json, notFound, serverError } from '@/lib/api/http';
import { compareQuerySchema } from '@/lib/utils/validators';

export const dynamic = 'force-dynamic';

/**
 * GET /api/rates/compare?from=SAR&to=EGP&amount=2000[&payout=cash_pickup]
 * Returns the full ranked comparison for a corridor and amount.
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const parsed = compareQuerySchema.safeParse({
    from: sp.get('from') ?? undefined,
    to: sp.get('to') ?? 'EGP',
    amount: sp.get('amount') ?? undefined,
    payout: sp.get('payout') ?? undefined,
  });
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'invalid query', parsed.error.flatten());
  if (parsed.data.to !== 'EGP') return badRequest('Only EGP is supported as the receive currency');

  try {
    const result = await compareCorridor(parsed.data.from, parsed.data.amount, { payout: parsed.data.payout });
    if (!result) return notFound('corridor not found');
    return json(result, { maxAge: 60, swr: 300 });
  } catch (err) {
    return serverError(err, 'failed to compare rates');
  }
}
