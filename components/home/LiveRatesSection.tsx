import { getLocale, getTranslations } from 'next-intl/server';
import { LiveRatesTicker } from '@/components/rates/LiveRatesTicker';
import { RateChartWithTabs } from '@/components/rates/RateChartWithTabs';
import type { CorridorRateSummary } from '@/lib/api/rates';
import type { RateHistoryPoint, SendCurrency } from '@/lib/types';

export async function LiveRatesSection({ summaries, initialPoints, initialCurrency }: { summaries: CorridorRateSummary[]; initialPoints: RateHistoryPoint[]; initialCurrency: SendCurrency }) {
  const t = await getTranslations('home');
  const locale = (await getLocale()) as 'ar' | 'en';
  const tabs = summaries.slice(0, 5).map((s) => ({
    currency: s.corridor.send_currency,
    flag: s.corridor.flag_emoji,
    label: locale === 'ar' ? s.corridor.send_country_ar : s.corridor.send_country,
  }));
  return (
    <section className="section bg-surface" aria-labelledby="live-rates-title">
      <div className="container-content">
        <div className="text-center">
          <h2 id="live-rates-title" className="section-title">
            {t('tickerTitle')}
          </h2>
          <p className="section-subtitle mx-auto">{t('tickerSubtitle')}</p>
        </div>
        <LiveRatesTicker summaries={summaries} className="mt-8" />
        <RateChartWithTabs corridors={tabs} initialCurrency={initialCurrency} initialPoints={initialPoints} className="mt-6" />
      </div>
    </section>
  );
}
