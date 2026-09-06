'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { FeeBreakdownBody } from '@/components/compare/FeeBreakdown';
import { SavingsBadge } from '@/components/compare/SavingsBadge';
import { SendButton } from '@/components/compare/SendButton';
import { Tabs } from '@/components/ui/Tabs';
import type { ComparisonResponse } from '@/lib/types';
import { formatEgp, formatNumber } from '@/lib/utils/formatters';

/**
 * "Example: sending X" block on the corridor+service page. We pre-compute the
 * comparison for a few amounts on the server so this stays static-friendly.
 */
export function ServiceCorridorExample({ serviceId, examples }: { serviceId: string; examples: { amount: number; data: ComparisonResponse }[] }) {
  const t = useTranslations('corridor');
  const tr = useTranslations('results');
  const locale = useLocale() as 'ar' | 'en';
  const [amountKey, setAmountKey] = useState(String(examples[0]?.amount ?? ''));
  const ex = examples.find((e) => String(e.amount) === amountKey) ?? examples[0];
  if (!ex) return null;
  const item = ex.data.results.find((r) => r.service.id === serviceId);
  const best = ex.data.results[0];
  if (!item || !best) {
    return <p className="text-small text-content-secondary">{tr('noResultsHint')}</p>;
  }
  const currency = ex.data.query.from;
  const name = locale === 'ar' ? item.service.name_ar : item.service.name;

  return (
    <div className="card p-5 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-navy">{t('exampleTitle', { amount: formatNumber(ex.amount, locale), currency })}</h2>
        <Tabs size="sm" value={amountKey} onChange={setAmountKey} options={examples.map((e) => ({ value: String(e.amount), label: formatNumber(e.amount, locale) }))} ariaLabel={t('exampleTitle', { amount: '', currency })} />
      </div>
      <p className="mt-2 text-small text-content-secondary">{t('rankInCorridor', { rank: item.rank, total: ex.data.results.length })}</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px]">
        <FeeBreakdownBody item={item} midMarketRate={ex.data.mid_market_rate} />
        <div className="flex flex-col justify-between gap-4 rounded-card bg-surface p-5">
          <div>
            <p className="text-caption text-content-secondary">{tr('familyReceives')}</p>
            <p className="num text-3xl font-extrabold text-navy" dir="ltr">
              {formatEgp(item.amount_received, locale)}
            </p>
            {item.rank === 1 ? (
              <SavingsBadge
                amount={item.savings_vs_worst}
                bestName={name}
                worstName={locale === 'ar' ? ex.data.results[ex.data.results.length - 1].service.name_ar : ex.data.results[ex.data.results.length - 1].service.name}
                className="mt-2"
                confetti={false}
              />
            ) : (
              <p className="mt-2 text-small text-danger">{tr('youLose', { amount: formatNumber(Math.round(best.amount_received - item.amount_received), locale) })}</p>
            )}
          </div>
          <SendButton serviceId={item.service.id} serviceName={name} corridorId={item.corridor_id} amount={ex.amount} fallbackUrl={item.affiliate_url} fullWidth />
        </div>
      </div>
    </div>
  );
}
