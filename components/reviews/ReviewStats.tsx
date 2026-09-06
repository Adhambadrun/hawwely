import { useLocale, useTranslations } from 'next-intl';
import { StarRating } from '@/components/ui/StarRating';
import type { ReviewStatsData } from '@/lib/api/content';
import { formatNumber } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';

export function ReviewStats({ stats, className }: { stats: ReviewStatsData; className?: string }) {
  const t = useTranslations('reviews');
  const locale = useLocale() as 'ar' | 'en';
  const max = Math.max(1, ...Object.values(stats.distribution));
  return (
    <div className={cn('card grid gap-6 p-5 md:grid-cols-[auto_1fr] md:items-center md:p-6', className)}>
      <div className="text-center md:pe-6 md:border-e md:border-card-border">
        <p className="num text-5xl font-extrabold text-navy" dir="ltr">
          {stats.average.toFixed(1)}
        </p>
        <StarRating value={stats.average} size="md" className="mt-1" />
        <p className="mt-1 text-caption text-content-secondary">{t('totalReviews', { count: formatNumber(stats.total, locale) })}</p>
        <p className="mt-1 text-caption font-semibold text-primary-700">{t('recommendPercent', { percent: stats.recommendPercent })}</p>
      </div>
      <ul className="space-y-1.5" aria-label={t('stats')}>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.distribution[star as 1 | 2 | 3 | 4 | 5] ?? 0;
          return (
            <li key={star} className="flex items-center gap-3 text-caption">
              <span className="num w-10 shrink-0 text-end font-semibold text-navy">{t('stars', { count: star })}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-pill bg-navy-50" role="progressbar" aria-valuenow={count} aria-valuemin={0} aria-valuemax={stats.total} aria-label={t('stars', { count: star })}>
                <div className="h-full rounded-pill bg-gold transition-all" style={{ width: `${(count / max) * 100}%` }} />
              </div>
              <span className="num w-8 shrink-0 text-content-secondary">{count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
