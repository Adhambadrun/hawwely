import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ServiceLogo } from '@/components/compare/ServiceLogo';
import { SpeedBadge } from '@/components/compare/SpeedBadge';
import { StarRating } from '@/components/ui/StarRating';
import type { RateWithService } from '@/lib/types';
import { formatMoney, formatPercent, formatRate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';

/** Static (SEO-friendly) table of every service's headline rate/fee in a corridor. */
export function CorridorRateTable({ rates, corridorSlug, className, caption }: { rates: RateWithService[]; corridorSlug: string; className?: string; caption: string }) {
  const t = useTranslations('services');
  const locale = useLocale() as 'ar' | 'en';
  const sorted = [...rates].sort((a, b) => b.exchange_rate - a.exchange_rate);
  return (
    <div className={cn('card overflow-hidden p-0', className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-small">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-surface text-caption uppercase tracking-wide text-content-secondary">
            <tr>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {locale === 'ar' ? 'الخدمة' : 'Service'}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {t('rateColumn')}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {t('markupColumn')}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {t('fee')}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {t('speedColumn')}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {t('rating')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {sorted.map((r) => {
              const name = locale === 'ar' ? r.service.name_ar : r.service.name;
              return (
                <tr key={r.id} className="transition-colors hover:bg-surface">
                  <th scope="row" className="px-4 py-3 text-start font-semibold text-navy">
                    <Link href={`/send-money/${corridorSlug}/${r.service.slug}`} className="inline-flex items-center gap-3 hover:text-primary-700">
                      <ServiceLogo src={r.service.logo_url} name={r.service.name} size={32} brandColor={r.service.brand_color} />
                      <span>{name}</span>
                    </Link>
                  </th>
                  <td className="num px-4 py-3 font-bold text-navy" dir="ltr">
                    {formatRate(r.exchange_rate, locale)}
                  </td>
                  <td className={cn('num px-4 py-3', r.markup_percent <= 0.5 ? 'text-primary-700' : r.markup_percent >= 3 ? 'text-danger' : 'text-content')} dir="ltr">
                    {formatPercent(r.markup_percent, locale)}
                  </td>
                  <td className="num px-4 py-3 text-content" dir="ltr">
                    {r.fixed_fee > 0 ? formatMoney(r.fixed_fee, r.fee_currency, locale) : '0'}
                    {r.percent_fee > 0 && <span className="text-caption text-content-secondary"> + {formatPercent(r.percent_fee, locale)}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <SpeedBadge speed={r.transfer_speed} minutes={r.transfer_speed_minutes} />
                  </td>
                  <td className="px-4 py-3">
                    <StarRating value={r.service.rating} size="sm" showValue />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
