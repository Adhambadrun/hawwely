import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ServiceLogo } from '@/components/compare/ServiceLogo';
import { PayoutMethods } from '@/components/compare/PayoutMethodBadge';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';
import type { Service } from '@/lib/types';
import { formatNumber } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';

export function ServiceListCard({ service, className, index = 0 }: { service: Service; className?: string; index?: number }) {
  const t = useTranslations('services');
  const locale = useLocale() as 'ar' | 'en';
  const name = locale === 'ar' ? service.name_ar : service.name;
  const description = (locale === 'ar' && service.description_ar) || service.description || '';
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  return (
    <article className={cn('card card-hover flex h-full flex-col p-5 animate-fade-up', className)} style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}>
      <div className="flex items-start gap-3">
        <ServiceLogo src={service.logo_url} name={service.name} size={48} brandColor={service.brand_color} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-bold text-navy">
              <Link href={`/services/${service.slug}`} className="hover:text-primary-700">
                {name}
              </Link>
            </h3>
            {service.is_featured && <Badge variant="gold">{t('featured')}</Badge>}
          </div>
          <div className="mt-1 flex items-center gap-2 text-caption text-content-secondary">
            <StarRating value={service.rating} size="sm" />
            <span className="num font-semibold text-navy">{service.rating.toFixed(1)}</span>
            <span>({t('reviews', { count: formatNumber(service.total_reviews, locale) })})</span>
          </div>
        </div>
      </div>
      <p className="mt-3 line-clamp-3 flex-1 text-small text-content-secondary">{description}</p>
      <PayoutMethods methods={service.payout_methods} className="mt-4" />
      <div className="mt-4 flex items-center justify-between border-t border-card-border pt-4 text-caption text-content-secondary">
        <span>{t('corridorsCount', { count: service.supported_corridors.length })}</span>
        <Link href={`/services/${service.slug}`} className="inline-flex items-center gap-1 text-small font-semibold text-primary-700 hover:underline">
          {t('viewDetails')}
          <Arrow className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
