'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Tabs } from '@/components/ui/Tabs';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import { useRateHistory } from '@/lib/hooks/useRates';
import type { RateHistoryPoint, SendCurrency } from '@/lib/types';
import { currencyToSlug } from '@/lib/utils/constants';
import { formatRate } from '@/lib/utils/formatters';
import { windowChange } from '@/lib/data/history';
import { cn } from '@/lib/utils/helpers';
import { RateChart } from './RateChart';

export interface RateChartWithTabsProps {
  corridors: { currency: SendCurrency; flag: string; label: string }[];
  initialCurrency: SendCurrency;
  initialPoints: RateHistoryPoint[];
  days?: number;
  className?: string;
}

/** Homepage chart: tabs switch corridor; the initial corridor is server-rendered. */
export function RateChartWithTabs({ corridors, initialCurrency, initialPoints, days = 7, className }: RateChartWithTabsProps) {
  const t = useTranslations('home');
  const tr = useTranslations('rates');
  const locale = useLocale() as 'ar' | 'en';
  const [currency, setCurrency] = useState<SendCurrency>(initialCurrency);
  const isInitial = currency === initialCurrency;
  const { points, loading } = useRateHistory(currency, days, null);
  const view = isInitial && !points ? initialPoints : points ?? [];
  const change = windowChange(view);
  const last = view[view.length - 1]?.mid_market_rate;

  return (
    <div className={cn('card p-4 md:p-6', className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-bold text-navy">{t('chartTitle', { pair: `${currency}/EGP` })}</h3>
          {last != null && (
            <p className="mt-1 flex items-baseline gap-2">
              <span className="num text-2xl font-extrabold text-navy" dir="ltr">
                {formatRate(last, locale)}
              </span>
              <span className={cn('num text-small font-semibold', change.percent >= 0 ? 'text-primary-700' : 'text-danger')} dir="ltr">
                {change.percent >= 0 ? '+' : ''}
                {change.percent.toFixed(2)}%
              </span>
            </p>
          )}
        </div>
        <Tabs<SendCurrency> size="sm" value={currency} onChange={setCurrency} options={corridors.map((c) => ({ value: c.currency, label: `${c.flag} ${c.currency}` }))} ariaLabel={tr('period')} />
      </div>
      <div className="mt-4">
        {loading && !isInitial && view.length === 0 ? <ChartSkeleton className="border-0 p-0 shadow-none" /> : <RateChart points={view} currency={currency} height={260} />}
      </div>
      <div className="mt-3 text-end">
        <Link href={`/rates/${currencyToSlug(currency)}`} className="text-small font-semibold text-primary-700 hover:underline">
          {tr('historyTitle', { pair: `${currency}/EGP` })} →
        </Link>
      </div>
    </div>
  );
}
