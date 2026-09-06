import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RateHistoryPanel } from '@/components/rates/RateHistoryPanel';
import { CorridorRateTable } from '@/components/corridors/CorridorRateTable';
import { CorridorCard } from '@/components/corridors/CorridorCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { JsonLd } from '@/components/shared/JsonLd';
import { getCorridors, resolveCorridor } from '@/lib/api/corridors';
import { getCorridorSummaries, getRateHistory, getRatesForCorridor } from '@/lib/api/rates';
import { breadcrumbJsonLd, buildMetadata, localizedUrl } from '@/lib/seo';
import { currencyToSlug, RATES_REVALIDATE_SECONDS } from '@/lib/utils/constants';
import type { Locale } from '@/i18n/routing';

export const revalidate = RATES_REVALIDATE_SECONDS;
export const dynamicParams = true;

type Props = { params: { locale: Locale; corridor: string } };

export async function generateStaticParams() {
  const corridors = await getCorridors();
  return corridors.map((c) => ({ corridor: currencyToSlug(c.send_currency) }));
}

export async function generateMetadata({ params: { locale, corridor: slug } }: Props): Promise<Metadata> {
  const corridor = await resolveCorridor(slug);
  if (!corridor) notFound();
  const t = await getTranslations({ locale, namespace: 'seo' });
  const currencyName = (locale === 'ar' ? corridor.currency_name_ar : corridor.currency_name) ?? corridor.send_currency;
  return buildMetadata({
    locale,
    path: `/rates/${currencyToSlug(corridor.send_currency)}`,
    title: t('rateHistoryTitle', { currency: currencyName, code: corridor.send_currency }),
    description: t('rateHistoryDescription', { currency: currencyName, code: corridor.send_currency }),
  });
}

export default async function RateHistoryPage({ params: { locale, corridor: slug } }: Props) {
  setRequestLocale(locale);
  const corridor = await resolveCorridor(slug);
  if (!corridor) notFound();

  const [t, tn, tc, history, { rates }, { summaries }] = await Promise.all([
    getTranslations('rates'),
    getTranslations('nav'),
    getTranslations('corridor'),
    getRateHistory(corridor, 30),
    getRatesForCorridor(corridor),
    getCorridorSummaries(),
  ]);
  const summary = summaries.find((s) => s.corridor.id === corridor.id);
  const currencyName = (locale === 'ar' ? corridor.currency_name_ar : corridor.currency_name) ?? corridor.send_currency;
  const pair = `${corridor.send_currency}/EGP`;
  const corridorSlug = currencyToSlug(corridor.send_currency);
  const others = summaries.filter((s) => s.corridor.id !== corridor.id).slice(0, 4);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tn('home'), url: localizedUrl(locale, '/') },
          { name: tn('rates'), url: localizedUrl(locale, '/rates') },
          { name: pair, url: localizedUrl(locale, `/rates/${corridorSlug}`) },
        ])}
      />
      <PageHeader
        title={`${corridor.flag_emoji} ${t('historyTitle', { pair })}`}
        subtitle={t('historySubtitle', { currency: currencyName })}
        eyebrow={<Breadcrumbs light items={[{ label: tn('rates'), href: '/rates' }, { label: pair }]} />}
      />
      <section className="section bg-surface">
        <div className="container-content space-y-10">
          <RateHistoryPanel corridor={corridor} initialPoints={history} bestServiceSlug={summary?.bestServiceSlug ?? null} bestServiceName={(locale === 'ar' ? summary?.bestServiceNameAr : summary?.bestServiceName) ?? null} />
          <div>
            <h2 className="section-title">{tc('tableTitle', { country: locale === 'ar' ? corridor.send_country_ar : corridor.send_country })}</h2>
            <CorridorRateTable rates={rates} corridorSlug={corridorSlug} className="mt-6" caption={t('tableCaption')} />
          </div>
          <div className="card border-primary/20 bg-primary-50/40 p-6">
            <h2 className="text-lg font-bold text-navy">{t('whatIsMid')}</h2>
            <p className="mt-2 max-w-3xl text-small leading-relaxed text-content">{t('midExplain')}</p>
          </div>
          <div>
            <h2 className="section-title">{tc('otherCorridors')}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((s) => (
                <CorridorCard key={s.corridor.id} corridor={s.corridor} midMarketRate={s.midMarketRate} changePercent={s.change24hPercent} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
