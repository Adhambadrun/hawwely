import { TrendingDown, TrendingUp } from 'lucide-react';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { CorridorRateSummary } from '@/lib/api/rates';
import { currencyToSlug } from '@/lib/utils/constants';
import { formatRate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';

/** Infinite horizontally scrolling ticker (CSS animation, duplicated list for seamless loop). */
export async function LiveRatesTicker({ summaries, className }: { summaries: CorridorRateSummary[]; className?: string }) {
  const locale = (await getLocale()) as 'ar' | 'en';
  const items = [...summaries, ...summaries];
  return (
    <div className={cn('mask-fade-x overflow-hidden rounded-card border border-card-border bg-white py-3', className)} dir="ltr" aria-label="live rates ticker">
      <ul className="flex w-max animate-ticker gap-3 pause-on-hover">
        {items.map((s, i) => {
          const up = s.change24hPercent >= 0;
          return (
            <li key={`${s.corridor.id}-${i}`} aria-hidden={i >= summaries.length}>
              <Link href={`/rates/${currencyToSlug(s.corridor.send_currency)}`} className="flex items-center gap-2 rounded-pill border border-card-border px-4 py-1.5 text-small transition hover:border-primary">
                <span>{s.corridor.flag_emoji}</span>
                <span className="font-bold text-navy">{s.corridor.send_currency}/EGP</span>
                <span className="num font-semibold text-navy">{formatRate(s.midMarketRate, locale)}</span>
                <span className={cn('num flex items-center gap-0.5 text-caption font-semibold', up ? 'text-primary-700' : 'text-danger')}>
                  {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(s.change24hPercent).toFixed(2)}%
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
