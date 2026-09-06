import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { refreshSession } from './lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Locale routing (/ -> ar at root, /en/* for English)
  const response = intlMiddleware(request) ?? NextResponse.next();
  // 2. Keep the Supabase session fresh (no-op in demo mode)
  return refreshSession(request, response);
}

export const config = {
  // Skip API routes, Next internals, PWA worker & static files
  matcher: ['/((?!api|_next|_vercel|sw\\.js|workbox-.*|manifest\\.json|robots\\.txt|sitemap\\.xml|.*\\..*).*)'],
};
