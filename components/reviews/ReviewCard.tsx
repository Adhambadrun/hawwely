import { BadgeCheck, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { StarRating } from '@/components/ui/StarRating';
import { ServiceLogo } from '@/components/compare/ServiceLogo';
import type { Review } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';

export function ReviewCard({ review, showService = true, className }: { review: Review; showService?: boolean; className?: string }) {
  const t = useTranslations('reviews');
  const ts = useTranslations('speed');
  const locale = useLocale() as 'ar' | 'en';
  const title = (locale === 'ar' && review.title_ar) || review.title;
  const body = (locale === 'ar' && review.body_ar) || review.body;
  const author = review.author_name || (locale === 'ar' ? 'مستخدم حوّلي' : 'Hawwely user');
  const serviceName = review.service ? (locale === 'ar' ? review.service.name_ar : review.service.name) : null;

  return (
    <article className={cn('card flex h-full flex-col p-5', className)} aria-label={title ?? author}>
      <header className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-50 text-body font-bold text-navy" aria-hidden>
          {author.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-bold text-navy">{author}</span>
            {review.is_verified && (
              <span className="inline-flex items-center gap-1 text-caption font-semibold text-primary-700">
                <BadgeCheck className="h-4 w-4" aria-hidden />
                {t('verified')}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-caption text-content-secondary">
            <StarRating value={review.rating} size="sm" />
            <time dateTime={review.created_at}>{formatDate(review.created_at, locale)}</time>
            {review.corridor && (
              <span>
                {review.corridor.flag_emoji} {review.corridor.send_currency} → EGP
              </span>
            )}
          </div>
        </div>
        {showService && review.service && (
          <Link href={`/services/${review.service.slug}`} className="flex shrink-0 items-center gap-2 rounded-pill border border-card-border px-2 py-1 text-caption font-semibold text-navy hover:border-primary" title={serviceName ?? undefined}>
            <ServiceLogo src={review.service.logo_url} name={review.service.name} size={20} />
            <span className="hidden sm:inline">{serviceName}</span>
          </Link>
        )}
      </header>

      {title && <h3 className="mt-4 text-body font-bold text-navy">{title}</h3>}
      {body && <p className="mt-2 flex-1 text-small leading-relaxed text-content">{body}</p>}

      <footer className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-card-border pt-3 text-caption text-content-secondary">
        {review.amount_sent != null && review.send_currency && <span className="num">{t('sent', { amount: `${formatNumber(review.amount_sent, locale)} ${review.send_currency}` })}</span>}
        {review.amount_received != null && <span className="num">{t('received', { amount: `${formatNumber(review.amount_received, locale)} EGP` })}</span>}
        {review.transfer_speed_actual && <span>{ts.has(review.transfer_speed_actual as never) ? ts(review.transfer_speed_actual as never) : review.transfer_speed_actual}</span>}
        {review.would_recommend != null && (
          <span className={cn('ms-auto inline-flex items-center gap-1 font-semibold', review.would_recommend ? 'text-primary-700' : 'text-danger')}>
            {review.would_recommend ? <ThumbsUp className="h-3.5 w-3.5" aria-hidden /> : <ThumbsDown className="h-3.5 w-3.5" aria-hidden />}
            {review.would_recommend ? t('recommends') : t('notRecommends')}
          </span>
        )}
      </footer>
    </article>
  );
}
