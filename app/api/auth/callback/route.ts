import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

/**
 * Supabase magic-link callback: exchanges the `code` for a session cookie,
 * then redirects to `next` (defaults to /alerts).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/alerts';
  const safeNext = next.startsWith('/') ? next : '/alerts';

  const supabase = createServerSupabase();
  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  }
  return NextResponse.redirect(`${origin}${safeNext}?auth_error=1`);
}
