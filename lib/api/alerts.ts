import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCorridorSummaries } from '@/lib/api/rates';
import type { RateAlert } from '@/lib/types';

export interface AlertCheckResult {
  checked: number;
  triggered: number;
  notified: { alert_id: string; user_id: string; corridor: string; rate: number; channels: string[] }[];
  persisted: boolean;
}

/**
 * Evaluate every active alert against the current mid-market rate.
 * Triggered alerts are marked with `triggered_at` and deactivated.
 * Notification delivery is pluggable: `deliver()` currently logs and is the
 * place to wire Resend / WhatsApp Cloud API / Telegram Bot API.
 */
export async function checkAlerts(): Promise<AlertCheckResult> {
  const admin = createAdminClient();
  const { summaries } = await getCorridorSummaries();
  const rateByCorridorId = new Map(summaries.map((s) => [s.corridor.id, s]));

  if (!admin) return { checked: 0, triggered: 0, notified: [], persisted: false };

  const { data, error } = await admin.from('rate_alerts').select('*').eq('is_active', true).limit(5000);
  if (error) throw new Error(`alerts query failed: ${error.message}`);
  const alerts = (data ?? []) as RateAlert[];

  const notified: AlertCheckResult['notified'] = [];
  const now = new Date().toISOString();

  for (const alert of alerts) {
    const summary = rateByCorridorId.get(alert.corridor_id);
    if (!summary) continue;
    const current = summary.midMarketRate;
    const target = Number(alert.target_rate);
    const hit = alert.direction === 'below' ? current <= target : current >= target;
    if (!hit) continue;

    const { error: updateError } = await admin.from('rate_alerts').update({ triggered_at: now, is_active: false }).eq('id', alert.id);
    if (updateError) {
      console.warn('[hawwely] failed to mark alert triggered', alert.id, updateError.message);
      continue;
    }

    await deliver(alert, current, summary.corridor.send_currency);
    notified.push({ alert_id: alert.id, user_id: alert.user_id, corridor: `${summary.corridor.send_currency}-EGP`, rate: current, channels: alert.notify_via });
  }

  return { checked: alerts.length, triggered: notified.length, notified, persisted: true };
}

async function deliver(alert: RateAlert, rate: number, currency: string): Promise<void> {
  const message = `🔔 ${currency}/EGP وصل ${rate.toFixed(4)}! حوّل دلوقتي على hawwely.com`;
  // Integration points (intentionally minimal; add providers as env vars become available):
  // - email:    Resend / Postmark using profiles.email
  // - whatsapp: WhatsApp Cloud API using profiles.whatsapp_number
  // - telegram: Bot API sendMessage using profiles.telegram_chat_id
  console.info('[hawwely] alert triggered', { alert: alert.id, channels: alert.notify_via, message });
}
