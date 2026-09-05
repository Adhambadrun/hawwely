import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/home/Hero';
import { TopPicks } from '@/components/home/TopPicks';
import { PopularCorridors } from '@/components/corridors/PopularCorridors';
import { HowItWorks } from '@/components/home/HowItWorks';
import { LiveRatesSection } from '@/components/home/LiveRatesSection';
import { SavingsCalculator } from '@/components/home/SavingsCalculator';
import { TrustSection } from '@/components/home/TrustSection';
import { BlogPreview } from '@/components/home/BlogPreview';
import { Newsletter } from '@/components/shared/Newsletter';
import { JsonLd } from '@/components/shared/JsonLd';
import { getCorridors } from '@/lib/api/corridors';
import { getServices } from '@/lib/api/services';
import { compareCorridor, getCorridorSummaries, getRateHistory, getSavingsCurve } from '@/lib/api/rates';
import { getBlogPosts, getTestimonials } from '@/lib/api/content';
import { buildMetadata, ORGANIZATION_JSONLD, websiteJsonLd } from '@/lib/seo';
import { DEFAULT_AMOUNT, DEFAULT_SEND_CURRENCY, RATES_REVALIDATE_SECONDS } from '@/lib/utils/constants';
import { SITE_STATS } from '@/lib/data/stats';
import type { Locale } from '@/i18n/routing';

export const revalidate = RATES_REVALIDATE_SECONDS;

type Props = { params: { locale: Locale } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    ...buildMetadata({ locale, path: '/', title: t('homeTitle'), description: t('homeDescription') }),
    // The root title must not use the "%s | حوّلي" template
    title: { absolute: t('homeTitle') },
  };
}

export default async function HomePage({ params: { locale } }: Props) {
  setRequestLocale(locale);

  const [corridors, services, { summaries, updatedAt }, initialComparison, posts, testimonials] = await Promise.all([
    getCorridors(),
    getServices(),
    getCorridorSummaries(),
    compareCorridor(DEFAULT_SEND_CURRENCY, DEFAULT_AMOUNT),
    getBlogPosts({ limit: 3 }),
    getTestimonials(),
  ]);

  const defaultCorridor = corridors.find((c) => c.send_currency === DEFAULT_SEND_CURRENCY) ?? corridors[0];
  const midMarketRate = summaries.find((s) => s.corridor.send_currency === DEFAULT_SEND_CURRENCY)?.midMarketRate ?? initialComparison?.mid_market_rate ?? 0;

  const [history, savingsCurve] = await Promise.all([
    defaultCorridor ? getRateHistory(defaultCorridor, 7, undefined, 4) : Promise.resolve([]),
    getSavingsCurve(DEFAULT_SEND_CURRENCY, [500, 1000, 2000, 3000, 5000, 10000, 20000]),
  ]);

  return (
    <>
      <JsonLd data={[ORGANIZATION_JSONLD, websiteJsonLd(locale)]} />
      <Hero corridors={corridors} lastUpdated={updatedAt} midMarketRate={midMarketRate} />
      <TopPicks initial={initialComparison} />
      <PopularCorridors summaries={summaries} />
      <HowItWorks />
      <LiveRatesSection summaries={summaries} initialPoints={history} initialCurrency={defaultCorridor?.send_currency ?? DEFAULT_SEND_CURRENCY} />
      <SavingsCalculator currency={DEFAULT_SEND_CURRENCY} curve={savingsCurve} />
      <TrustSection testimonials={testimonials} services={services} stats={{ ...SITE_STATS, services: services.length, countries: corridors.length }} />
      <BlogPreview posts={posts.posts} />
      <section className="section bg-white">
        <div className="container-content">
          <Newsletter />
        </div>
      </section>
    </>
  );
}
