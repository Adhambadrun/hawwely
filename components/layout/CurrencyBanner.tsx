import { getLocale } from 'next-intl/server';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getCorridorSummaries } from '@/lib/api/rates';
import { formatRate } from '@/lib/utils/formatters';
import { currencyToSlug } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/helpers';

/** Slim top banner with live mid-market rates for the top corridors. */
export async function CurrencyBanner() {
  const locale = (await getLocale()) as 'ar' | 'en';
  let summaries: Awaited<ReturnType<typeof getCorridorSummaries>>['summaries'] = [];
  try {
    summaries = (await getCorridorSummaries()).summaries.slice(0, 6);
  } catch {
    return null;
  }
  if (summaries.length === 0) return null;

  return (
    <div className="hidden border-b border-white/10 bg-navy-900 text-white md:block" aria-label="live rates">
      <div className="container-content flex h-9 items-center gap-6 overflow-hidden text-caption">
        <span className="flex shrink-0 items-center gap-1.5 font-bold text-primary-light">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-primary-light opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-light" />
          </span>
          LIVE
        </span>
        <ul className="flex items-center gap-6">
          {summaries.map((s) => {
            const up = s.change24hPercent >= 0;
            return (
              <li key={s.corridor.id}>
                <Link href={`/rates/${currencyToSlug(s.corridor.send_currency)}`} className="flex items-center gap-1.5 whitespace-nowrap hover:text-primary-light">
                  <span aria-hidden>{s.corridor.flag_emoji}</span>
                  <span className="font-semibold">{s.corridor.send_currency}/EGP</span>
                  <span className="num">{formatRate(s.midMarketRate, locale)}</span>
                  <span className={cn('num flex items-center gap-0.5', up ? 'text-primary-light' : 'text-red-400')}>
                    {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(s.change24hPercent).toFixed(2)}%
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
