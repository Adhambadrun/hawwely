'use client';

import { useState } from 'react';
import { ChevronDown, Crown, Star, Tag, Zap } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/Badge';
import type { ComparisonResultItem } from '@/lib/types';
import { formatEgp, formatMoney, formatPercent, formatRate, timeAgo } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';
import { FeeBreakdownBody } from './FeeBreakdown';
import { PayoutMethods } from './PayoutMethodBadge';
import { SendButton } from './SendButton';
import { ServiceLogo } from './ServiceLogo';
import { SpeedBadge } from './SpeedBadge';

const RANK_STYLES: Record<number, { ring: string; medal: string; label: string }> = {
  1: { ring: 'rank-gold', medal: '🥇', label: 'bg-gold text-navy' },
  2: { ring: 'rank-silver', medal: '🥈', label: 'bg-[#C0C0C0] text-navy' },
  3: { ring: 'rank-bronze', medal: '🥉', label: 'bg-[#CD7F32] text-white' },
};

export interface ServiceCardProps {
  item: ComparisonResultItem;
  midMarketRate: number;
  bestReceived: number;
  compact?: boolean;
  index?: number;
  showRank?: boolean;
  corridorSlug?: string;
}

export function ServiceCard({ item, midMarketRate, bestReceived, compact = false, index = 0, showRank = true, corridorSlug }: ServiceCardProps) {
  const t = useTranslations('results');
  const locale = useLocale() as 'ar' | 'en';
  const [open, setOpen] = useState(false);
  const rank = RANK_STYLES[item.rank];
  const name = locale === 'ar' ? item.service.name_ar : item.service.name;
  const lossVsBest = bestReceived - item.amount_received;

  return (
    <article
      className={cn(
        'card relative animate-fade-up transition-shadow',
        showRank && rank?.ring,
        !rank && 'hover:shadow-hover',
        compact ? 'p-4' : 'p-5 md:p-6',
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 80}ms` }}
      aria-label={`${name} — ${formatEgp(item.amount_received, locale)}`}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        {showRank && (
          <span className={cn('num flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-small font-extrabold', rank ? rank.label : 'bg-navy-50 text-navy')} aria-label={t('rank', { rank: item.rank })}>
            {rank ? rank.medal : item.rank}
          </span>
        )}
        <ServiceLogo src={item.service.logo_url} name={item.service.name} size={compact ? 40 : 48} brandColor={item.service.brand_color} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href={`/services/${item.service.slug}`} className="truncate text-lg font-bold text-navy hover:text-primary-700">
              {name}
            </Link>
            {item.is_cheapest && (
              <Badge variant="gold">
                <Crown className="h-3 w-3" /> {t('cheapest')}
              </Badge>
            )}
            {item.is_fastest && (
              <Badge variant="success">
                <Zap className="h-3 w-3" /> {t('fastest')}
              </Badge>
            )}
            {item.is_best_rated && !item.is_cheapest && (
              <Badge variant="info">
                <Star className="h-3 w-3" /> {t('bestRated')}
              </Badge>
            )}
            {item.promo && (
              <Badge variant="warning" title={locale === 'ar' ? item.promo.text_ar : item.promo.text}>
                <Tag className="h-3 w-3" /> {t('promo')}
              </Badge>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-caption text-content-secondary">
            <span className="inline-flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-gold text-gold" aria-hidden />
              <span className="num font-semibold text-navy">{item.service.rating.toFixed(1)}</span>
            </span>
            <span aria-hidden>·</span>
            <span className="num">{item.service.review_count.toLocaleString(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US')}</span>
            <span className="sr-only">reviews</span>
          </div>
        </div>
        <div className="hidden text-end sm:block">
          <p className="text-caption text-content-secondary">{t('familyReceives')}</p>
          <p className="num text-2xl font-extrabold text-primary-700">{formatEgp(item.amount_received, locale)}</p>
        </div>
      </div>

      {/* Mobile amount */}
      <div className="mt-4 flex items-end justify-between sm:hidden">
        <div>
          <p className="text-caption text-content-secondary">{t('familyReceives')}</p>
          <p className="num text-3xl font-extrabold text-primary-700">{formatEgp(item.amount_received, locale)}</p>
        </div>
        {lossVsBest > 0.5 && <p className="num text-caption font-semibold text-danger">−{formatEgp(lossVsBest, locale)}</p>}
      </div>

      {/* Facts grid */}
      <dl className={cn('mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-small sm:grid-cols-4', compact && 'mt-3')}>
        <div>
          <dt className="text-caption text-content-secondary">{t('exchangeRate')}</dt>
          <dd className="num font-bold text-navy" dir="ltr">
            {formatRate(item.exchange_rate, locale)}
            <span className={cn('num ms-1 text-caption font-medium', item.markup_percent <= 0.05 ? 'text-primary-700' : 'text-content-secondary')}>
              ({item.markup_percent <= 0.05 ? '0%' : `−${formatPercent(item.markup_percent, locale, 1)}`})
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-caption text-content-secondary">{t('fee')}</dt>
          <dd className="num font-bold text-navy" dir="ltr">
            {item.total_fee === 0 ? (locale === 'ar' ? 'بدون عمولة' : 'No fee') : formatMoney(item.total_fee, item.fee_currency, locale, { decimals: 2, showCode: true })}
          </dd>
        </div>
        <div>
          <dt className="text-caption text-content-secondary">{t('speed')}</dt>
          <dd>
            <SpeedBadge speed={item.transfer_speed} minutes={item.transfer_speed_minutes} />
          </dd>
        </div>
        <div>
          <dt className="text-caption text-content-secondary">{t('payout')}</dt>
          <dd>
            <PayoutMethods methods={item.payout_methods} />
          </dd>
        </div>
      </dl>

      {lossVsBest > 0.5 && (
        <p className="mt-3 hidden text-caption font-medium text-danger sm:block" role="note">
          {t('youLose', { amount: formatEgp(lossVsBest, locale).replace(/ (جنيه|EGP)$/, '') })}
        </p>
      )}

      {/* Actions */}
      <div className={cn('mt-5 flex flex-col gap-2 sm:flex-row sm:items-center', compact && 'mt-4')}>
        <SendButton
          serviceId={item.service.id}
          serviceName={name}
          corridorId={item.corridor_id}
          amount={item.amount_sent}
          fallbackUrl={item.affiliate_url}
          size={compact ? 'md' : 'lg'}
          variant={item.is_cheapest ? 'primary' : 'secondary'}
          className="flex-1 sm:flex-none sm:min-w-[180px]"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={`fees-${item.service.slug}`}
          className="btn-ghost justify-between sm:justify-center"
        >
          {open ? t('hideDetails') : t('feeDetails')}
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden />
        </button>
        {corridorSlug && (
          <Link href={`/send-money/${corridorSlug}/${item.service.slug}`} className="text-small font-semibold text-content-secondary hover:text-primary-700 sm:ms-auto">
            {locale === 'ar' ? 'صفحة الخدمة →' : 'Service page →'}
          </Link>
        )}
      </div>

      <div id={`fees-${item.service.slug}`} className={cn('grid transition-[grid-template-rows] duration-300 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="mt-5 border-t border-card-border pt-5">
            <FeeBreakdownBody item={item} midMarketRate={midMarketRate} />
            <p className="mt-3 text-caption text-content-secondary">{t('verified', { time: timeAgo(item.last_verified_at, locale) })}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
