'use client';

import { useState } from 'react';
import { Bell, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Tabs } from '@/components/ui/Tabs';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { useLiveRates, type RatesDto } from '@/lib/hooks/useRates';
import { currencyToSlug } from '@/lib/utils/constants';
import { formatRate, timeAgo } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';

type Mode = 'mid' | 'best';

export function LiveRatesTable({ initial }: { initial: RatesDto }) {
  const t = useTranslations('rates');
  const tc = useTranslations('common');
  const locale = useLocale() as 'ar' | 'en';
  const { data, loading, refresh, lastFetched } = useLiveRates(initial);
  const [mode, setMode] = useState<Mode>('mid');
  const rows = data?.rates ?? initial.rates;

  return (
    <div className="card overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-card-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="badge bg-red-50 text-red-600">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            {tc('live')}
          </span>
          <span className="text-caption text-content-secondary">
            {t('autoRefresh')}
            {lastFetched && ` · ${tc('updatedAgo', { time: timeAgo(lastFetched, locale) })}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Tabs<Mode>
            size="sm"
            value={mode}
            onChange={setMode}
            ariaLabel={t('viewMode')}
            options={[
              { value: 'mid', label: t('showMidMarket') },
              { value: 'best', label: t('showBest') },
            ]}
          />
          <button type="button" onClick={() => void refresh()} className="btn-ghost btn-sm" disabled={loading} aria-label={t('refreshNow')}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} aria-hidden />
            <span className="hidden sm:inline">{loading ? t('refreshing') : t('refreshNow')}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-small">
          <caption className="sr-only">{t('tableCaption')}</caption>
          <thead className="bg-surface text-caption uppercase tracking-wide text-content-secondary">
            <tr>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {t('pairLabel', { from: '' }).replace('/EGP', '').trim() || (locale === 'ar' ? 'العملة' : 'Currency')}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {mode === 'mid' ? t('midMarket') : t('bestService')}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {t('change24h')}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {t('highToday')}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {t('lowToday')}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {t('bestService')}
              </th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">{tc('seeMore')}</span>
              </th>
            </tr>
          </thead>
          <tbody className={cn('divide-y divide-card-border transition-opacity', loading && 'opacity-60')} aria-busy={loading}>
            {rows.map((r) => {
              const up = r.change_24h_percent >= 0;
              const slug = currencyToSlug(r.currency);
              return (
                <tr key={r.currency} className="transition-colors hover:bg-surface">
                  <th scope="row" className="px-4 py-3 text-start">
                    <Link href={`/rates/${slug}`} className="inline-flex items-center gap-3 font-bold text-navy hover:text-primary-700">
                      <CountryFlag emoji={r.flag} label={r.country} size="md" />
                      <span>
                        <span className="num">{r.currency}/EGP</span>
                        <span className="block text-caption font-normal text-content-secondary">{locale === 'ar' ? r.country_ar : r.country}</span>
                      </span>
                    </Link>
                  </th>
                  <td className="num px-4 py-3 text-lg font-extrabold text-navy" dir="ltr">
                    {formatRate(mode === 'mid' ? r.mid_market_rate : r.best_rate, locale)}
                  </td>
                  <td className={cn('num px-4 py-3 font-semibold', up ? 'text-primary-700' : 'text-danger')} dir="ltr">
                    <span className="inline-flex items-center gap-1">
                      {up ? <TrendingUp className="h-4 w-4" aria-hidden /> : <TrendingDown className="h-4 w-4" aria-hidden />}
                      {up ? '+' : ''}
                      {r.change_24h_percent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="num px-4 py-3 text-content" dir="ltr">
                    {formatRate(r.high_24h, locale)}
                  </td>
                  <td className="num px-4 py-3 text-content" dir="ltr">
                    {formatRate(r.low_24h, locale)}
                  </td>
                  <td className="px-4 py-3 text-content">
                    {r.best_service_slug ? (
                      <Link href={`/services/${r.best_service_slug}`} className="font-semibold text-navy hover:text-primary-700">
                        {locale === 'ar' ? r.best_service_name_ar : r.best_service_name}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/alerts?corridor=${r.corridor_id}`} className="btn-ghost btn-sm" aria-label={t('alert')}>
                        <Bell className="h-4 w-4" aria-hidden />
                      </Link>
                      <Link href={`/send-money/${slug}`} className="btn-outline btn-sm">
                        {t('compareThis')}
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
