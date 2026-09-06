import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, hasServiceRole } from './config';

let adminClient: SupabaseClient | null = null;

/**
 * Service-role client for trusted server code only (cron jobs, click logging).
 * NEVER import this from a client component. Returns null when not configured.
 */
export function createAdminClient(): SupabaseClient | null {
  if (!hasServiceRole()) return null;
  if (adminClient) return adminClient;
  adminClient = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}
