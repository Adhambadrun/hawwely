/** Central place to read Supabase env config and detect demo mode. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Demo mode = no Supabase credentials configured.
 * In demo mode the app serves the bundled seed dataset (lib/data) so the
 * whole site works out of the box; writes (alerts, reviews, reports,
 * subscriptions, clicks) are accepted and logged but not persisted.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && /^https?:\/\//.test(SUPABASE_URL));
}

export function hasServiceRole(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
