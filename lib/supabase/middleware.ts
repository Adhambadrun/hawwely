import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './config';

/**
 * Refreshes the Supabase auth session cookie on every request so server
 * components always see a fresh session. No-op in demo mode.
 */
export async function refreshSession(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Touching getUser() triggers the token refresh when needed.
  await supabase.auth.getUser();
  return response;
}
