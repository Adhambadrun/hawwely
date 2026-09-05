import { ArrowLeft, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CountryFlag } from '@/components/ui/CountryFlag';
import type { Corridor } from '@/lib/types';
import { currencyToSlug } from '@/lib/utils/constants';
import { formatRate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';

export interface CorridorCardProps {
  corridor: Corridor;
  midMarketRate: number;
  changePercent?: number;
  servicesCount?: number;
  bestServiceName?: string | null;
  className?: string;
  variant?: 'compact' | 'detailed';
}

export function CorridorCard({ corridor, midMarketRate, changePercent = 0, servicesCount, bestServiceName, className, variant = 'compact' }: CorridorCardProps) {
  const t = useTranslations('home');
  const tc = useTranslations('corridor');
  const locale = useLocale() as 'ar' | 'en';
  const country = locale === 'ar' ? corridor.send_country_ar : corridor.send_country;
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const up = changePercent >= 0;

  return (
    <Link
      href={`/send-money/${currencyToSlug(corridor.send_currency)}`}
      className={cn('card card-hover group flex flex-col gap-4 p-5 focus-visible:ring-2 focus-visible:ring-primary', className)}
      aria-label={t('corridorFrom', { country })}
    >
      <div className="flex items-center gap-3">
        <CountryFlag emoji={corridor.flag_emoji} label={country} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-navy">{t('corridorFrom', { country })}</p>
          <p className="num text-caption text-content-secondary">{corridor.send_currency}/EGP</p>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="num text-2xl font-extrabold text-navy" dir="ltr">
            {formatRate(midMarketRate, locale)}
          </p>
          <p className={cn('num flex items-center gap-1 text-caption font-semibold', up ? 'text-primary-700' : 'text-danger')} dir="ltr">
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {up ? '+' : ''}
            {changePercent.toFixed(2)}%
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-small font-semibold text-primary-700 transition-transform group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[2px]">
          {t('corridorCompare')}
          <Arrow className="h-4 w-4" />
        </span>
      </div>

      {variant === 'detailed' && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-card-border pt-3 text-caption text-content-secondary">
          {servicesCount != null && <span>{tc('servicesCount', { count: servicesCount })}</span>}
          {bestServiceName && (
            <span>
              {tc('bestServiceNow')}: <span className="font-semibold text-navy">{bestServiceName}</span>
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
