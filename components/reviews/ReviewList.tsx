import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Review } from '@/lib/types';
import { cn } from '@/lib/utils/helpers';
import { ReviewCard } from './ReviewCard';

export function ReviewList({ reviews, showService = true, className, emptyHref = '/reviews/write' }: { reviews: Review[]; showService?: boolean; className?: string; emptyHref?: string }) {
  const t = useTranslations('reviews');
  if (reviews.length === 0) {
    return (
      <EmptyState
        title={t('noReviews')}
        description={t('noReviewsHint')}
        action={
          <Link href={emptyHref} className="btn-primary">
            {t('write')}
          </Link>
        }
        className={className}
      />
    );
  }
  return (
    <ul className={cn('grid gap-4 md:grid-cols-2', className)}>
      {reviews.map((r) => (
        <li key={r.id}>
          <ReviewCard review={r} showService={showService} />
        </li>
      ))}
    </ul>
  );
}
