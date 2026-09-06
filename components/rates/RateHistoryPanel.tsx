'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Tabs } from '@/components/ui/Tabs';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import { useRateHistory } from '@/lib/hooks/useRates';
import type { Corridor, RateHistoryPoint } from '@/lib/types';
import { historyStats, windowChange } from '@/lib/data/history';
import { formatRate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';
import { RateChart } from './RateChart';

type Days = '7' | '30' | '90';

export function RateHistoryPanel({ corridor, initialPoints, bestServiceSlug, bestServiceName }: { corridor: Corridor; initialPoints: RateHistoryPoint[]; bestServiceSlug: string | null; bestServiceName: string | null }) {
  const t = useTranslations('rates');
  const locale = useLocale() as 'ar' | 'en';
  const [days, setDays] = useState<Days>('30');
  const [showBest, setShowBest] = useState(false);
  const isInitial = days === '30' && !showBest;
  const { points, loading } = useRateHistory(corridor.send_currency, Number(days), showBest ? bestServiceSlug : null);
  const view = isInitial && !points ? initialPoints : points ?? [];
  const stats = historyStats(view);
  const change = windowChange(view);
  const dirLabel = change.percent > 0.01 ? t('up') : change.percent < -0.01 ? t('down') : t('flat');

  return (
    <div className="card p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-caption text-content-secondary">{t('current')}</p>
          <p className="num text-4xl font-extrabold text-navy" dir="ltr">
            {stats ? formatRate(stats.current, locale) : '—'}
          </p>
          <p className={cn('num mt-1 text-small font-semibold', change.percent >= 0 ? 'text-primary-700' : 'text-danger')} dir="ltr">
            {change.percent >= 0 ? '+' : ''}
            {change.percent.toFixed(2)}% <span className="text-content-secondary">({dirLabel})</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs<Days>
            size="sm"
            value={days}
            onChange={setDays}
            ariaLabel={t('period')}
            options={[
              { value: '7', label: t('days7') },
              { value: '30', label: t('days30') },
              { value: '90', label: t('days90') },
            ]}
          />
          {bestServiceSlug && (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-pill border border-card-border px-3 py-1.5 text-caption font-semibold text-navy">
              <input type="checkbox" checked={showBest} onChange={(e) => setShowBest(e.target.checked)} className="h-4 w-4 accent-primary" />
              {t('showBest')}
            </label>
          )}
        </div>
      </div>

      <div className="mt-4">{loading && view.length === 0 ? <ChartSkeleton className="border-0 p-0 shadow-none" /> : <RateChart points={view} currency={corridor.send_currency} showService={showBest} serviceName={bestServiceName ?? undefined} height={320} />}</div>

      {stats && (
        <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: t('high'), value: stats.high },
            { label: t('low'), value: stats.low },
            { label: t('average'), value: stats.average },
            { label: t('changeWindow'), value: change.abs, signed: true },
          ].map((s) => (
            <div key={s.label} className="rounded-card bg-surface p-3">
              <dt className="text-caption text-content-secondary">{s.label}</dt>
              <dd className="num mt-0.5 text-lg font-bold text-navy" dir="ltr">
                {s.signed && s.value > 0 ? '+' : ''}
                {formatRate(s.value, locale)}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href={`/alerts?corridor=${corridor.id}`} className="btn-secondary">
          <Bell className="h-4 w-4" aria-hidden />
          {t('setAlert')}
        </Link>
        <Link href={`/send-money/${corridor.send_currency.toLowerCase()}-to-egp`} className="btn-primary">
          {t('compareThis')}
        </Link>
      </div>
    </div>
  );
}
