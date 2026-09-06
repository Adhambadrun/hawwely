import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { SpeedBadge } from '@/components/compare/SpeedBadge';
import { CountryFlag } from '@/components/ui/CountryFlag';
import type { Corridor, Rate } from '@/lib/types';
import { currencyToSlug } from '@/lib/utils/constants';
import { formatMoney, formatPercent, formatRate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';

/** Per-service table: one row per corridor the service supports. */
export function ServiceRatesTable({ rows, serviceSlug, className, caption }: { rows: { corridor: Corridor; rate: Rate }[]; serviceSlug: string; className?: string; caption: string }) {
  const t = useTranslations('services');
  const tc = useTranslations('corridor');
  const locale = useLocale() as 'ar' | 'en';
  return (
    <div className={cn('card overflow-hidden p-0', className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-small">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-surface text-caption uppercase tracking-wide text-content-secondary">
            <tr>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {locale === 'ar' ? 'من' : 'From'}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {t('rateColumn')}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {tc('midMarketNow')}
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
                <span className="sr-only">{t('viewCorridor')}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {rows.map(({ corridor, rate }) => {
              const slug = currencyToSlug(corridor.send_currency);
              return (
                <tr key={corridor.id} className="transition-colors hover:bg-surface">
                  <th scope="row" className="px-4 py-3 text-start font-semibold text-navy">
                    <span className="inline-flex items-center gap-2">
                      <CountryFlag emoji={corridor.flag_emoji} label={locale === 'ar' ? corridor.send_country_ar : corridor.send_country} size="sm" />
                      <span>
                        {locale === 'ar' ? corridor.send_country_ar : corridor.send_country} <span className="num text-caption text-content-secondary">({corridor.send_currency})</span>
                      </span>
                    </span>
                  </th>
                  <td className="num px-4 py-3 font-bold text-navy" dir="ltr">
                    {formatRate(rate.exchange_rate, locale)}
                  </td>
                  <td className="num px-4 py-3 text-content-secondary" dir="ltr">
                    {formatRate(rate.mid_market_rate, locale)}
                  </td>
                  <td className={cn('num px-4 py-3', rate.markup_percent <= 0.5 ? 'text-primary-700' : rate.markup_percent >= 3 ? 'text-danger' : 'text-content')} dir="ltr">
                    {formatPercent(rate.markup_percent, locale)}
                  </td>
                  <td className="num px-4 py-3 text-content" dir="ltr">
                    {rate.fixed_fee > 0 ? formatMoney(rate.fixed_fee, rate.fee_currency, locale) : '0'}
                    {rate.percent_fee > 0 && <span className="text-caption text-content-secondary"> + {formatPercent(rate.percent_fee, locale)}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <SpeedBadge speed={rate.transfer_speed} minutes={rate.transfer_speed_minutes} />
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Link href={`/send-money/${slug}/${serviceSlug}`} className="text-small font-semibold text-primary-700 hover:underline">
                      {t('viewCorridor')}
                    </Link>
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
