import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CorridorPageResults } from '@/components/corridors/CorridorPageResults';
import { CorridorRateTable } from '@/components/corridors/CorridorRateTable';
import { CorridorCard } from '@/components/corridors/CorridorCard';
import { RateChart } from '@/components/rates/RateChart';
import { ReviewList } from '@/components/reviews/ReviewList';
import { BlogCard } from '@/components/blog/BlogCard';
import { FaqAccordion } from '@/components/shared/FaqAccordion';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { JsonLd } from '@/components/shared/JsonLd';
import { ResultsSkeleton } from '@/components/ui/Skeleton';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { getCorridors, resolveCorridor } from '@/lib/api/corridors';
import { compareCorridor, getCorridorSummaries, getRateHistory, getRatesForCorridor } from '@/lib/api/rates';
import { getFaqs, getPostsForCorridor, getReviews } from '@/lib/api/content';
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, localizedUrl } from '@/lib/seo';
import { currencyToSlug, DEFAULT_AMOUNT, RATES_REVALIDATE_SECONDS } from '@/lib/utils/constants';
import { formatNumber, formatRate } from '@/lib/utils/formatters';
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
  const t = await getTranslations({ locale, namespace: 'corridor' });
  const country = locale === 'ar' ? corridor.send_country_ar : corridor.send_country;
  const title = (locale === 'ar' ? corridor.seo_title_ar : corridor.seo_title) ?? t('title', { country, flag: corridor.flag_emoji });
  const description = (locale === 'ar' ? corridor.seo_description_ar : corridor.seo_description) ?? t('subtitle', { count: 10, currency: corridor.send_currency });
  return buildMetadata({ locale, path: `/send-money/${currencyToSlug(corridor.send_currency)}`, title, description });
}

export default async function CorridorPage({ params: { locale, corridor: slug } }: Props) {
  setRequestLocale(locale);
  const corridor = await resolveCorridor(slug);
  if (!corridor) notFound();

  // The page is statically generated (ISR) for the default amount; the client
  // re-runs the comparison when ?amount=/?payout= differ.
  const amount = DEFAULT_AMOUNT;
  const [t, tn, tr, corridors, { rates, updatedAt }, initial, history, reviews, faqs, posts, { summaries }] = await Promise.all([
    getTranslations('corridor'),
    getTranslations('nav'),
    getTranslations('rates'),
    getCorridors(),
    getRatesForCorridor(corridor),
    compareCorridor(corridor.send_currency, amount),
    getRateHistory(corridor, 30),
    getReviews({ corridorId: corridor.id, limit: 4 }),
    getFaqs({ corridorId: corridor.id }),
    getPostsForCorridor(corridor.send_currency, 3),
    getCorridorSummaries(),
  ]);

  const country = locale === 'ar' ? corridor.send_country_ar : corridor.send_country;
  const corridorSlug = currencyToSlug(corridor.send_currency);
  const path = `/send-money/${corridorSlug}`;
  const mid = initial?.mid_market_rate ?? rates[0]?.mid_market_rate ?? 0;
  const best = initial?.results[0];
  const fastest = initial?.results.find((r) => r.is_fastest);
  const others = summaries.filter((s) => s.corridor.id !== corridor.id).slice(0, 4);
  const faqItems = faqs.slice(0, 6).map((f) => ({ question: locale === 'ar' ? f.question_ar : f.question, answer: locale === 'ar' ? f.answer_ar : f.answer }));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: tn('home'), url: localizedUrl(locale, '/') },
            { name: tn('sendMoney'), url: localizedUrl(locale, '/send-money') },
            { name: country, url: localizedUrl(locale, path) },
          ]),
          ...(faqItems.length ? [faqJsonLd(faqItems)] : []),
        ]}
      />

      <section className="relative overflow-hidden bg-navy-gradient text-white">
        <div className="hero-dots absolute inset-0 opacity-60" aria-hidden />
        <div className="container-content relative py-10 md:py-14">
          <Breadcrumbs light items={[{ label: tn('sendMoney'), href: '/send-money' }, { label: country }]} />
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <CountryFlag emoji={corridor.flag_emoji} label={country} size="xl" />
                <h1 className="text-balance text-hero-m font-extrabold md:text-4xl">{t('title', { country, flag: '' }).replace(/\s+/g, ' ')}</h1>
              </div>
              <p className="mt-3 max-w-2xl text-body text-white/80">{t('subtitle', { count: rates.length, currency: corridor.send_currency })}</p>
            </div>
            <dl className="grid grid-cols-3 gap-3 text-center md:min-w-[420px]">
              <div className="rounded-card border border-white/10 bg-white/10 p-3 backdrop-blur">
                <dt className="text-caption text-white/70">{t('midMarketNow')}</dt>
                <dd className="num mt-1 text-lg font-extrabold" dir="ltr">
                  {formatRate(mid, locale)}
                </dd>
              </div>
              <div className="rounded-card border border-white/10 bg-white/10 p-3 backdrop-blur">
                <dt className="text-caption text-white/70">{t('cheapestNow')}</dt>
                <dd className="mt-1 truncate text-lg font-extrabold text-primary-light">{best ? (locale === 'ar' ? best.service.name_ar : best.service.name) : '—'}</dd>
              </div>
              <div className="rounded-card border border-white/10 bg-white/10 p-3 backdrop-blur">
                <dt className="text-caption text-white/70">{t('fastestNow')}</dt>
                <dd className="mt-1 truncate text-lg font-extrabold text-gold">{fastest ? (locale === 'ar' ? fastest.service.name_ar : fastest.service.name) : '—'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="section bg-surface" id="results">
        <div className="container-content">
          <Suspense fallback={<ResultsSkeleton count={5} />}>
            <CorridorPageResults corridor={corridor} corridors={corridors} initial={initial} lastUpdated={updatedAt} />
          </Suspense>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-content">
          <h2 className="section-title">{t('tableTitle', { country })}</h2>
          <p className="section-subtitle">{t('subtitle', { count: rates.length, currency: corridor.send_currency })}</p>
          <CorridorRateTable rates={rates} corridorSlug={corridorSlug} className="mt-6" caption={t('tableTitle', { country })} />
        </div>
      </section>

      <section className="section bg-surface">
        <div className="container-content grid gap-8 lg:grid-cols-2">
          <div className="card p-5 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-navy">{t('chartTitle', { currency: corridor.send_currency })}</h2>
              <Link href={`/rates/${corridorSlug}`} className="text-small font-semibold text-primary-700 hover:underline">
                {tr('historyTitle', { pair: `${corridor.send_currency}/EGP` })} →
              </Link>
            </div>
            <RateChart points={history} currency={corridor.send_currency} height={260} className="mt-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy">{t('faqTitle', { country })}</h2>
            <FaqAccordion faqs={faqs.slice(0, 6)} className="mt-4" defaultOpenFirst />
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-content">
          <div className="flex items-end justify-between gap-4">
            <h2 className="section-title">{t('reviewsTitle', { country })}</h2>
            <Link href="/reviews/write" className="btn-outline shrink-0">
              {locale === 'ar' ? 'اكتب تجربتك' : 'Share your experience'}
            </Link>
          </div>
          <ReviewList reviews={reviews} className="mt-6" />
        </div>
      </section>

      {posts.length > 0 && (
        <section className="section bg-surface">
          <div className="container-content">
            <h2 className="section-title">{t('relatedTitle')}</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {posts.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section bg-white">
        <div className="container-content">
          <div className="flex items-end justify-between gap-4">
            <h2 className="section-title">{t('otherCorridors')}</h2>
            <Link href="/send-money" className="text-small font-semibold text-primary-700 hover:underline">
              {t('explore')} →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((s) => (
              <CorridorCard key={s.corridor.id} corridor={s.corridor} midMarketRate={s.midMarketRate} changePercent={s.change24hPercent} />
            ))}
          </div>
          <p className="mt-6 text-caption text-content-secondary">{t('searchVolume', { count: formatNumber(corridor.monthly_search_volume, locale) })}</p>
        </div>
      </section>
    </>
  );
}
