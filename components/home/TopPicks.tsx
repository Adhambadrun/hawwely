'use client';

import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ServiceCard } from '@/components/compare/ServiceCard';
import { ResultsSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useComparison } from '@/lib/hooks/useComparison';
import type { ComparisonResponse } from '@/lib/types';
import { currencyToSlug } from '@/lib/utils/constants';
import { formatEgp } from '@/lib/utils/formatters';
import { useStore } from '@/store/useStore';

/**
 * Homepage "Quick results preview": shows the top 3 services for the user's
 * current corridor/amount (persisted in the store). Server-rendered for the
 * default SAR/2000 and re-fetched client-side when the user changes inputs.
 */
export function TopPicks({ initial }: { initial: ComparisonResponse | null }) {
  const t = useTranslations('home');
  const tr = useTranslations('results');
  const locale = useLocale() as 'ar' | 'en';
  const currency = useStore((s) => s.currency);
  const amount = useStore((s) => s.amount);
  const hasHydrated = useStore((s) => s.hasHydrated);
  const setAmount = useStore((s) => s.setAmount);
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  const { data, loading, error, run } = useComparison({ from: currency, amount }, { auto: false, initialData: initial });

  useEffect(() => {
    if (!hasHydrated) return;
    if (!amount) setAmount(initial?.query.amount ?? 2000);
    void run({ from: currency, amount: amount || initial?.query.amount || 2000 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, currency, amount]);

  const view = data ?? initial;
  const top = view?.results.slice(0, 3) ?? [];
  const best = view?.results[0];
  const worst = view?.results[view.results.length - 1];

  return (
    <section className="section bg-surface" aria-labelledby="top-picks-title">
      <div className="container-content">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="top-picks-title" className="section-title">
              {t('topPicksTitle', { amount: (view?.query.amount ?? amount).toLocaleString('en-US'), currency: view?.query.from ?? currency })}
            </h2>
            <p className="section-subtitle">{t('topPicksSubtitle')}</p>
          </div>
          <Link href={`/send-money/${currencyToSlug(view?.query.from ?? currency)}?amount=${view?.query.amount ?? amount}`} className="btn-outline shrink-0">
            {tr('viewFullResults')}
          </Link>
        </div>

        <div className="mt-8">
          {loading && !view ? (
            <ResultsSkeleton count={3} />
          ) : error && !view ? (
            <EmptyState title={tr('noResults')} description={error} />
          ) : top.length === 0 ? (
            <EmptyState title={tr('noResults')} description={tr('noResultsHint')} />
          ) : (
            <div className={`grid gap-5 lg:grid-cols-3 ${loading ? 'opacity-60 transition-opacity' : ''}`} aria-busy={loading}>
              {top.map((item, i) => (
                <ServiceCard key={item.service.id} item={item} midMarketRate={view!.mid_market_rate} bestReceived={best!.amount_received} index={i} compact />
              ))}
            </div>
          )}
        </div>

        {best && worst && view && view.summary.max_savings > 0 && (
          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-card border border-primary/30 bg-primary-50/70 p-5 md:flex-row">
            <p className="flex items-center gap-3 text-body font-semibold text-navy">
              <Lightbulb className="h-6 w-6 shrink-0 text-warning" aria-hidden />
              <span>
                {tr('saveHint', {
                  amount: formatEgp(view.summary.max_savings, locale).replace(/ (جنيه|EGP)$/, ''),
                  best: locale === 'ar' ? best.service.name_ar : best.service.name,
                  worst: locale === 'ar' ? worst.service.name_ar : worst.service.name,
                })}
              </span>
            </p>
            <Link href={`/send-money/${currencyToSlug(view.query.from)}?amount=${view.query.amount}`} className="btn-primary shrink-0">
              {tr('viewFullResults').replace(' →', '')}
              <Arrow className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
