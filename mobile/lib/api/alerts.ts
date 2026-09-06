import { getSupabase } from '@/lib/supabase/client';
import { useStore, type LocalAlert } from '@/store/useStore';
import { fetchRates } from './client';
import { getCorridorById } from './client';
import { notifyLocal } from '@/lib/notifications';
import i18n from '@/i18n';
import { formatRate } from '@/lib/shared/formatters';

/** Alerts live in Supabase (RLS: owner only) when signed in; otherwise on-device. */
export async function listAlerts(userId: string | null): Promise<LocalAlert[]> {
  const supabase = getSupabase();
  if (supabase && userId) {
    const { data, error } = await supabase.from('rate_alerts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      corridor_id: row.corridor_id,
      currency: getCorridorById(row.corridor_id)?.send_currency ?? 'SAR',
      target_rate: Number(row.target_rate),
      direction: row.direction,
      notify_via: row.notify_via,
      is_active: row.is_active,
      created_at: row.created_at,
      triggered_at: row.triggered_at,
    }));
  }
  return useStore.getState().localAlerts;
}

export async function createAlert(userId: string | null, input: Omit<LocalAlert, 'id' | 'created_at' | 'triggered_at' | 'is_active'>): Promise<LocalAlert> {
  const supabase = getSupabase();
  if (supabase && userId) {
    const channels = input.notify_via.filter((c) => c !== 'push');
    const { data, error } = await supabase
      .from('rate_alerts')
      .insert({ user_id: userId, corridor_id: input.corridor_id, target_rate: input.target_rate, direction: input.direction, notify_via: channels.length ? channels : ['email'] })
      .select('*')
      .single();
    if (error) throw error;
    const created: LocalAlert = { ...input, id: data.id, is_active: true, created_at: data.created_at, triggered_at: null };
    // keep a local copy too so push evaluation works on-device
    useStore.getState().addLocalAlert(created);
    return created;
  }
  const local: LocalAlert = { ...input, id: `local_${Date.now().toString(36)}`, is_active: true, created_at: new Date().toISOString(), triggered_at: null };
  useStore.getState().addLocalAlert(local);
  return local;
}

export async function deleteAlert(userId: string | null, id: string): Promise<void> {
  const supabase = getSupabase();
  if (supabase && userId && !id.startsWith('local_')) {
    const { error } = await supabase.from('rate_alerts').delete().eq('id', id);
    if (error) throw error;
  }
  useStore.getState().removeLocalAlert(id);
}

/**
 * Evaluate on-device alerts against the latest rates and fire a local
 * notification for any that hit. Called on app foreground + after refresh.
 */
export async function evaluateLocalAlerts(): Promise<number> {
  const { localAlerts, markLocalAlertTriggered, notifPrefs } = useStore.getState();
  const active = localAlerts.filter((a) => a.is_active);
  if (!active.length || !notifPrefs.rateAlerts) return 0;
  const snapshot = await fetchRates();
  let fired = 0;
  for (const alert of active) {
    const row = snapshot.rates.find((r) => r.corridor_id === alert.corridor_id || r.currency === alert.currency);
    if (!row) continue;
    const current = row.mid_market_rate;
    const hit = alert.direction === 'below' ? current <= alert.target_rate : current >= alert.target_rate;
    if (!hit) continue;
    markLocalAlertTriggered(alert.id, current);
    fired += 1;
    await notifyLocal(i18n.t('notifications.alertTitle'), i18n.t('notifications.alertBody', { currency: alert.currency, rate: formatRate(current, i18n.language === 'en' ? 'en' : 'ar') }), {
      url: `/corridor/${alert.currency.toLowerCase()}-to-egp`,
    });
  }
  return fired;
}
