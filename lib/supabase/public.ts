import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './config';

let publicClient: SupabaseClient | null = null;

/**
 * Cookie-less anon client for PUBLIC data (services, corridors, rates, blog…).
 * Using this (instead of the cookie-bound server client) keeps pages statically
 * renderable / ISR-cacheable, because it never calls `cookies()`.
 * Returns null in demo mode.
 */
export function createPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (publicClient) return publicClient;
  publicClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return publicClient;
}
