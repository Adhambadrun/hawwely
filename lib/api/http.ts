import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function json<T>(data: T, init?: ResponseInit & { maxAge?: number; swr?: number }) {
  const headers = new Headers(init?.headers);
  if (init?.maxAge != null) {
    headers.set('Cache-Control', `public, s-maxage=${init.maxAge}, stale-while-revalidate=${init.swr ?? init.maxAge * 2}`);
  }
  return NextResponse.json(data, { ...init, headers });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function unauthorized(message = 'unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function notFound(message = 'not found') {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function tooMany(message = 'rate limited') {
  return NextResponse.json({ error: message }, { status: 429, headers: { 'Retry-After': '60' } });
}

export function serverError(err: unknown, fallback = 'internal error') {
  console.error('[hawwely] API error:', err);
  const message = err instanceof Error ? err.message : fallback;
  return NextResponse.json({ error: process.env.NODE_ENV === 'production' ? fallback : message }, { status: 500 });
}

export function zodErrorResponse(err: ZodError) {
  const first = err.issues[0];
  return NextResponse.json(
    { error: first?.message ?? 'invalid input', details: err.flatten() },
    { status: 422 },
  );
}

/** Simple in-memory fixed-window rate limiter (per process). Good enough to stop abuse of write endpoints. */
const buckets = new Map<string, { count: number; resetAt: number }>();
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

export function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== 'production';
  const auth = request.headers.get('authorization');
  const url = new URL(request.url);
  return auth === `Bearer ${secret}` || url.searchParams.get('secret') === secret;
}
