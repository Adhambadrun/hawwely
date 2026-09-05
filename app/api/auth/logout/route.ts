import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();
  if (supabase) await supabase.auth.signOut();
  const next = request.nextUrl.searchParams.get('next') ?? '/';
  return NextResponse.redirect(new URL(next.startsWith('/') ? next : '/', request.url), { status: 303 });
}
