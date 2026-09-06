import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LiveRatesTable } from '@/components/rates/LiveRatesTable';
import { RateChartWithTabs } from '@/components/rates/RateChartWithTabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { CTABanner } from '@/components/shared/CTABanner';
import { JsonLd } from '@/components/shared/JsonLd';
import { getCorridorSummaries, getRateHistory } from '@/lib/api/rates';
import type { RatesDto } from '@/lib/hooks/useRates';
import { breadcrumbJsonLd, buildMetadata, localizedUrl } from '@/lib/seo';
import { RATES_REVALIDATE_SECONDS } from '@/lib/utils/constants';
import type { Locale } from '@/i18n/routing';

export const revalidate = RATES_REVALIDATE_SECONDS;

type Props = { params: { locale: Locale } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  return buildMetadata({ locale, path: '/rates', title: t('ratesTitle'), description: t('ratesDescription') });
}

export default async function RatesPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const [t, tn, { summaries, source, updatedAt }] = await Promise.all([getTranslations('rates'), getTranslations('nav'), getCorridorSummaries()]);
  const first = summaries[0];
  const history = first ? await getRateHistory(first.corridor, 7, undefined, 4) : [];

  const initial: RatesDto = {
    source,
    updated_at: updatedAt,
    rates: summaries.map((s) => ({
      currency: s.corridor.send_currency,
      country: s.corridor.send_country,
      country_ar: s.corridor.send_country_ar,
      flag: s.corridor.flag_emoji,
      corridor_id: s.corridor.id,
      mid_market_rate: s.midMarketRate,
      best_rate: s.bestRate,
      best_service_slug: s.bestServiceSlug,
      best_service_name: s.bestServiceName,
      best_service_name_ar: s.bestServiceNameAr,
      change_24h_percent: Math.round(s.change24hPercent * 100) / 100,
      high_24h: s.high24h,
      low_24h: s.low24h,
      services_count: s.servicesCount,
    })),
  };

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tn('home'), url: localizedUrl(locale, '/') },
          { name: tn('rates'), url: localizedUrl(locale, '/rates') },
        ])}
      />
      <PageHeader title={t('title')} subtitle={t('subtitle')} eyebrow={<Breadcrumbs light items={[{ label: tn('rates') }]} />} />
      <section className="section bg-surface">
        <div className="container-content space-y-8">
          <LiveRatesTable initial={initial} />
          {first && (
            <RateChartWithTabs
              corridors={summaries.slice(0, 6).map((s) => ({ currency: s.corridor.send_currency, flag: s.corridor.flag_emoji, label: locale === 'ar' ? s.corridor.send_country_ar : s.corridor.send_country }))}
              initialCurrency={first.corridor.send_currency}
              initialPoints={history}
            />
          )}
          <div className="card border-primary/20 bg-primary-50/40 p-6">
            <h2 className="text-lg font-bold text-navy">{t('whatIsMid')}</h2>
            <p className="mt-2 max-w-3xl text-small leading-relaxed text-content">{t('midExplain')}</p>
          </div>
          <CTABanner />
        </div>
      </section>
    </>
  );
}
