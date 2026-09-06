'use client';

import { useMemo, useState } from 'react';
import { ArrowUpDown, Filter, SearchX, Share2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs } from '@/components/ui/Tabs';
import type { ComparisonResponse, PayoutMethod } from '@/lib/types';
import { APP_URL, PAYOUT_METHODS, currencyToSlug, type SortOption } from '@/lib/utils/constants';
import { formatEgp, formatMoney, formatRate, timeAgo } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';
import { useStore } from '@/store/useStore';
import { SavingsBadge } from './SavingsBadge';
import { ServiceCard } from './ServiceCard';
import { SendButton } from './SendButton';
import { SocialShare } from '@/components/shared/SocialShare';

export interface ComparisonResultsProps {
  data: ComparisonResponse;
  /** Show only the first N cards with a "show all" toggle */
  initialVisible?: number;
  showControls?: boolean;
  showSavings?: boolean;
  showStickyBar?: boolean;
  className?: string;
}

export function ComparisonResults({ data, initialVisible, showControls = true, showSavings = true, showStickyBar = false, className }: ComparisonResultsProps) {
  const t = useTranslations('results');
  const tp = useTranslations('payout');
  const locale = useLocale() as 'ar' | 'en';
  const sort = useStore((s) => s.sort);
  const setSort = useStore((s) => s.setSort);
  const [payoutFilter, setPayoutFilter] = useState<PayoutMethod | 'all'>('all');
  const [expanded, setExpanded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const results = useMemo(() => {
    let list = data.results;
    if (payoutFilter !== 'all') list = list.filter((r) => r.payout_methods.includes(payoutFilter));
    const sorted = [...list];
    if (sort === 'fastest') sorted.sort((a, b) => a.transfer_speed_minutes - b.transfer_speed_minutes || b.amount_received - a.amount_received);
    else if (sort === 'rating') sorted.sort((a, b) => b.service.rating - a.service.rating || b.amount_received - a.amount_received);
    else sorted.sort((a, b) => a.rank - b.rank);
    return sorted;
  }, [data.results, payoutFilter, sort]);

  const best = data.results[0];
  const worst = data.results[data.results.length - 1];
  const bestReceived = best?.amount_received ?? 0;
  const visible = initialVisible && !expanded ? results.slice(0, initialVisible) : results;
  const corridorSlug = currencyToSlug(data.query.from);
  const bestName = best ? (locale === 'ar' ? best.service.name_ar : best.service.name) : '';
  const worstName = worst ? (locale === 'ar' ? worst.service.name_ar : worst.service.name) : '';

  const shareUrl = `${APP_URL}${locale === 'en' ? '/en' : ''}/send-money/${corridorSlug}?amount=${data.query.amount}`;
  const shareText = t('shareText', { best: bestName, worst: worstName, amount: Math.round(data.summary.max_savings).toLocaleString('en-US') });

  if (data.results.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="h-8 w-8" />}
        title={t('noResults')}
        description={t('noResultsHint')}
        action={
          data.skipped.length > 0 ? (
            <ul className="space-y-1 text-caption text-content-secondary">
              {data.skipped.map((s) => (
                <li key={s.service_slug}>
                  <SkippedLabel entry={s} currency={data.query.from} />
                </li>
              ))}
            </ul>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className={cn('space-y-5', className)}>
      {showSavings && best && worst && data.summary.max_savings > 0 && (
        <SavingsBadge amount={data.summary.max_savings} bestName={bestName} worstName={worstName} />
      )}

      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-2 text-caption">
        <Badge variant="gold">{t('summaryCheapest', { service: bestName })}</Badge>
        {data.summary.fastest_service && (
          <Badge variant="success">
            {t('summaryFastest', {
              service: (() => {
                const f = data.results.find((r) => r.service.slug === data.summary.fastest_service);
                return f ? (locale === 'ar' ? f.service.name_ar : f.service.name) : '';
              })(),
            })}
          </Badge>
        )}
        <Badge variant="outline">{t('compareCount', { count: data.summary.services_compared })}</Badge>
        <Badge variant="outline">
          {t('midMarket')}: <span className="num" dir="ltr">{formatRate(data.mid_market_rate, locale)}</span>
        </Badge>
        {data.summary.source === 'demo' && <Badge variant="warning">{locale === 'ar' ? 'أسعار توضيحية' : 'Demo rates'}</Badge>}
        <span className="ms-auto text-content-secondary">{t('ratesAsOf', { time: timeAgo(data.summary.last_updated, locale) })}</span>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-content-secondary" aria-hidden />
            <Tabs<SortOption>
              size="sm"
              ariaLabel={t('title')}
              value={sort}
              onChange={setSort}
              options={[
                { value: 'cheapest', label: t('sortCheapest') },
                { value: 'fastest', label: t('sortFastest') },
                { value: 'rating', label: t('sortRating') },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-content-secondary" aria-hidden />
            <Tabs<PayoutMethod | 'all'>
              size="sm"
              ariaLabel={t('payout')}
              value={payoutFilter}
              onChange={setPayoutFilter}
              options={[{ value: 'all', label: t('filterAll') }, ...PAYOUT_METHODS.map((m) => ({ value: m, label: tp(m) }))]}
            />
          </div>
        </div>
      )}

      {/* Cards */}
      {visible.length === 0 ? (
        <EmptyState icon={<SearchX className="h-8 w-8" />} title={t('noResults')} description={t('noResultsHint')} action={<Button variant="outline" onClick={() => setPayoutFilter('all')}>{t('filterAll')}</Button>} />
      ) : (
        <div className="space-y-4" role="list" aria-label={t('title')}>
          {visible.map((item, i) => (
            <div role="listitem" key={item.service.id}>
              <ServiceCard item={item} midMarketRate={data.mid_market_rate} bestReceived={bestReceived} index={i} corridorSlug={corridorSlug} />
            </div>
          ))}
        </div>
      )}

      {initialVisible && results.length > initialVisible && (
        <div className="text-center">
          <Button variant="outline" onClick={() => setExpanded((e) => !e)}>
            {expanded ? t('showTop') : t('showAll', { count: results.length })}
          </Button>
        </div>
      )}

      {/* Skipped services */}
      {data.skipped.length > 0 && (
        <details className="rounded-card border border-dashed border-card-border bg-surface p-4 text-caption text-content-secondary">
          <summary className="cursor-pointer font-semibold text-navy">{t('skipped', { count: data.skipped.length })}</summary>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {data.skipped.map((s) => (
              <li key={s.service_slug}>
                <SkippedLabel entry={s} currency={data.query.from} />
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Share */}
      {best && worst && data.summary.max_savings > 0 && (
        <div className="rounded-card border border-card-border bg-white p-4">
          <button type="button" onClick={() => setShareOpen((o) => !o)} className="flex w-full items-center justify-between text-small font-semibold text-navy">
            <span className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" /> {locale === 'ar' ? 'شارك النتيجة مع أصحابك' : 'Share this result with friends'}
            </span>
            <span className="text-content-secondary">{shareOpen ? '−' : '+'}</span>
          </button>
          {shareOpen && <SocialShare url={shareUrl} text={shareText} className="mt-3" />}
        </div>
      )}

      <p className="text-caption text-content-secondary">{t('affiliateNote')}</p>

      {/* Sticky best bar (mobile) */}
      {showStickyBar && best && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-card-border bg-white/95 p-3 shadow-modal backdrop-blur safe-bottom md:hidden">
          <div className="container-content flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-caption text-content-secondary">{t('bestChoice')}</p>
              <p className="truncate text-small font-bold text-navy">
                🥇 {bestName} — <span className="num text-primary-700">{formatEgp(best.amount_received, locale)}</span>
              </p>
            </div>
            <SendButton serviceId={best.service.id} serviceName={bestName} corridorId={best.corridor_id} amount={best.amount_sent} fallbackUrl={best.affiliate_url} size="md" />
          </div>
        </div>
      )}

      <Link href={`/send-money/${corridorSlug}`} className="sr-only">
        {t('viewFullResults')}
      </Link>
    </div>
  );
}

function SkippedLabel({ entry, currency }: { entry: ComparisonResponse['skipped'][number]; currency: string }) {
  const t = useTranslations('results');
  const locale = useLocale() as 'ar' | 'en';
  const name = locale === 'ar' ? entry.service_name_ar : entry.service_name;
  if (entry.reason === 'below_min' && entry.min_amount != null) {
    return <>{t('skippedBelowMin', { service: name, amount: formatMoney(entry.min_amount, currency, locale, { showCode: true }) })}</>;
  }
  if (entry.reason === 'above_max' && entry.max_amount != null) {
    return <>{t('skippedAboveMax', { service: name, amount: formatMoney(entry.max_amount, currency, locale, { showCode: true }) })}</>;
  }
  return <>{t('skippedFee', { service: name })}</>;
}
