'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, BellOff, LogOut, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { User } from '@supabase/supabase-js';
import { useSearchParams } from 'next/navigation';
import { AlertForm } from './AlertForm';
import { MagicLinkForm } from './MagicLinkForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import type { Corridor, RateAlert } from '@/lib/types';
import type { AlertValues } from '@/lib/utils/validators';
import { formatDate, formatRate } from '@/lib/utils/formatters';
import { useStore } from '@/store/useStore';

export function AlertsDashboard({ corridors, midRates }: { corridors: Corridor[]; midRates: Record<string, number> }) {
  const t = useTranslations('alerts');
  const ta = useTranslations('auth');
  const locale = useLocale() as 'ar' | 'en';
  const params = useSearchParams();
  const pushToast = useStore((s) => s.pushToast);
  const supabase = createClient();
  const configured = !!supabase;

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!configured);
  const [alerts, setAlerts] = useState<RateAlert[] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Auth state
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get<{ alerts: RateAlert[] }>('/api/alerts');
      setAlerts(res.data.alerts);
    } catch {
      setAlerts([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) void load();
    else setAlerts(null);
  }, [user, load]);

  const create = async (values: AlertValues) => {
    setSubmitting(true);
    try {
      await axios.post('/api/alerts', values);
      pushToast({ title: t('successCreate'), variant: 'success' });
      await load();
    } catch (err) {
      const msg = axios.isAxiosError(err) ? (err.response?.data as { error?: string } | undefined)?.error : undefined;
      pushToast({ title: msg ?? ta('error'), variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    const prev = alerts;
    setAlerts((a) => a?.filter((x) => x.id !== id) ?? null);
    try {
      await axios.delete('/api/alerts', { params: { id } });
      pushToast({ title: t('successDelete'), variant: 'success' });
    } catch {
      setAlerts(prev);
    }
  };

  const logout = async () => {
    await supabase?.auth.signOut();
    setUser(null);
    pushToast({ title: ta('loggedOut') });
  };

  const corridorFor = (a: RateAlert) => a.corridor ?? corridors.find((c) => c.id === a.corridor_id);
  const active = alerts?.filter((a) => a.is_active && !a.triggered_at) ?? [];
  const triggered = alerts?.filter((a) => a.triggered_at) ?? [];

  if (!authReady) {
    return (
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid gap-8 lg:grid-cols-[420px_1fr] lg:items-start">
        <div className="card p-6">
          <h2 className="text-xl font-bold text-navy">{t('loginRequired')}</h2>
          <p className="mt-1 text-small text-content-secondary">{t('loginHint')}</p>
          <MagicLinkForm className="mt-5" next={`/alerts${params.get('corridor') ? `?corridor=${params.get('corridor')}` : ''}`} />
          {!configured && <p className="mt-4 rounded-btn bg-warning/10 p-3 text-caption text-amber-800">{t('demoNotice')}</p>}
        </div>
        <HowAlertsWork />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[420px_1fr] lg:items-start">
      <div className="card p-6 lg:sticky lg:top-24">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-navy">{t('addNew')}</h2>
            <p className="mt-1 truncate text-caption text-content-secondary" dir="ltr">
              {t('loggedInAs', { email: user.email ?? '' })}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} aria-label={ta('logout')}>
            <LogOut className="h-4 w-4" aria-hidden />
            {ta('logout')}
          </Button>
        </div>
        <AlertForm corridors={corridors} midRates={midRates} defaultCorridorId={params.get('corridor') ?? undefined} onSubmit={create} submitting={submitting} className="mt-5" />
      </div>

      <div className="space-y-8">
        <section aria-labelledby="active-alerts">
          <div className="flex items-center justify-between">
            <h2 id="active-alerts" className="text-xl font-bold text-navy">
              {t('activeAlerts')}
            </h2>
            {alerts && <span className="text-caption text-content-secondary">{t('youHave', { count: active.length })}</span>}
          </div>
          {alerts === null ? (
            <div className="mt-4 space-y-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : active.length === 0 ? (
            <EmptyState className="mt-4" icon={<BellOff className="h-10 w-10" />} title={t('noAlerts')} description={t('noAlertsHint')} />
          ) : (
            <ul className="mt-4 space-y-3">
              {active.map((a) => {
                const c = corridorFor(a);
                const current = c ? midRates[c.send_currency] : undefined;
                return (
                  <li key={a.id} className="card flex items-center gap-4 p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xl" aria-hidden>
                      {c?.flag_emoji ?? <Bell className="h-5 w-5 text-primary" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-navy">
                        {c ? `${c.send_currency}/EGP` : '—'} {t(a.direction === 'above' ? 'goesAbove' : 'goesBelow')}{' '}
                        <span className="num" dir="ltr">
                          {formatRate(Number(a.target_rate), locale)}
                        </span>
                      </p>
                      <p className="mt-0.5 text-caption text-content-secondary">
                        {current != null && `${t('currentRate', { rate: formatRate(current, locale) })} · `}
                        {a.notify_via.map((v) => t(v)).join(' · ')} · {t('created', { date: formatDate(a.created_at, locale) })}
                      </p>
                    </div>
                    <Badge variant="warning">{t('waiting')}</Badge>
                    <button type="button" onClick={() => remove(a.id)} className="btn-ghost btn-sm text-danger" aria-label={t('delete')}>
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {triggered.length > 0 && (
          <section aria-labelledby="triggered-alerts">
            <h2 id="triggered-alerts" className="text-xl font-bold text-navy">
              {t('history')}
            </h2>
            <ul className="mt-4 space-y-3">
              {triggered.map((a) => {
                const c = corridorFor(a);
                return (
                  <li key={a.id} className="card flex items-center gap-4 border-primary/30 bg-primary-50/40 p-4">
                    <span className="text-xl" aria-hidden>
                      {c?.flag_emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-navy">
                        {c ? `${c.send_currency}/EGP` : '—'} → <span className="num">{formatRate(Number(a.target_rate), locale)}</span>
                      </p>
                      <p className="mt-0.5 text-caption text-content-secondary">{t('triggeredAt', { date: formatDate(a.triggered_at as string, locale), rate: formatRate(Number(a.target_rate), locale) })}</p>
                    </div>
                    <Badge variant="success">{t('triggered')}</Badge>
                    <button type="button" onClick={() => remove(a.id)} className="btn-ghost btn-sm text-danger" aria-label={t('delete')}>
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <HowAlertsWork />
      </div>
    </div>
  );
}

function HowAlertsWork() {
  const t = useTranslations('alerts');
  const steps = [t('how1'), t('how2'), t('how3')];
  return (
    <section className="card p-6" aria-labelledby="how-alerts">
      <h2 id="how-alerts" className="text-lg font-bold text-navy">
        {t('howTitle')}
      </h2>
      <ol className="mt-4 space-y-3">
        {steps.map((s, i) => (
          <li key={s} className="flex items-start gap-3 text-small text-content">
            <span className="num flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-caption font-bold text-white">{i + 1}</span>
            <span className="pt-1">{s}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
