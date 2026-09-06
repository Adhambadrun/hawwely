import { useCallback, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signInWithEmail: (email: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

/** Supabase magic-link auth. In demo mode (no keys) `configured` is false and user is null. */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    // Handle magic-link deep links: hawwely://auth?code=… (PKCE) or #access_token=…
    const handleUrl = async ({ url }: { url: string }) => {
      try {
        const parsed = Linking.parse(url);
        const code = typeof parsed.queryParams?.code === 'string' ? parsed.queryParams.code : null;
        if (code) await supabase.auth.exchangeCodeForSession(code);
        const hash = url.split('#')[1];
        if (hash) {
          const params = new URLSearchParams(hash);
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          if (access_token && refresh_token) await supabase.auth.setSession({ access_token, refresh_token });
        }
      } catch (err) {
        console.warn('[hawwely] auth link failed', err);
      }
    };
    const linkSub = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then((url) => {
      if (url) void handleUrl({ url });
    });
    return () => {
      sub.subscription.unsubscribe();
      linkSub.remove();
    };
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) return { ok: false, error: 'not_configured' };
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: Linking.createURL('/auth') } });
    return error ? { ok: false, error: error.message } : { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase()?.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  return { user, session, loading, configured: isSupabaseConfigured, signInWithEmail, signOut };
}
