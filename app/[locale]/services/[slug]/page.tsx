import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ServiceHeader } from '@/components/services/ServiceHeader';
import { ProsCons } from '@/components/services/ProsCons';
import { ServiceRatesTable } from '@/components/services/ServiceRatesTable';
import { ServiceListCard } from '@/components/services/ServiceListCard';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewStats } from '@/components/reviews/ReviewStats';
import { FaqAccordion } from '@/components/shared/FaqAccordion';
import { JsonLd } from '@/components/shared/JsonLd';
import { CTABanner } from '@/components/shared/CTABanner';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { getCorridors } from '@/lib/api/corridors';
import { getServiceBySlug, getServices, getSimilarServices } from '@/lib/api/services';
import { getAllRates } from '@/lib/api/rates';
import { computeReviewStats, getFaqs, getReviews } from '@/lib/api/content';
import { buildAffiliateUrl } from '@/lib/utils/affiliate';
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, localizedUrl } from '@/lib/seo';
import { currencyToSlug, RATES_REVALIDATE_SECONDS } from '@/lib/utils/constants';
import type { Locale } from '@/i18n/routing';

export const revalidate = RATES_REVALIDATE_SECONDS;
export const dynamicParams = true;

type Props = { params: { locale: Locale; slug: string } };

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const service = await getServiceBySlug(slug);
  if (!service) notFound();
  const name = locale === 'ar' ? service.name_ar : service.name;
  const title = locale === 'ar' ? `${name} — مراجعة وأسعار تحويل الفلوس لمصر` : `${name} — Review & Rates for Sending Money to Egypt`;
  const description = (locale === 'ar' && service.description_ar) || service.description || title;
  return buildMetadata({ locale, path: `/services/${service.slug}`, title, description });
}

export default async function ServicePage({ params: { locale, slug } }: Props) {
  setRequestLocale(locale);
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const [t, tn, corridors, { rates }, reviews, faqs, similar] = await Promise.all([
    getTranslations('services'),
    getTranslations('nav'),
    getCorridors(),
    getAllRates(),
    getReviews({ serviceId: service.id, limit: 6 }),
    getFaqs({ serviceId: service.id }),
    getSimilarServices(service, 3),
  ]);

  const name = locale === 'ar' ? service.name_ar : service.name;
  const description = (locale === 'ar' && service.description_ar) || service.description || '';
  const rows = corridors
    .map((corridor) => ({ corridor, rate: rates.find((r) => r.service_id === service.id && r.corridor_id === corridor.id) }))
    .filter((r): r is { corridor: (typeof corridors)[number]; rate: NonNullable<typeof r.rate> } => !!r.rate)
    .sort((a, b) => a.corridor.popularity_rank - b.corridor.popularity_rank);
  const stats = computeReviewStats(reviews);
  const faqItems = faqs.slice(0, 6).map((f) => ({ question: locale === 'ar' ? f.question_ar : f.question, answer: locale === 'ar' ? f.answer_ar : f.answer }));
  const affiliateUrl = buildAffiliateUrl(service, null) ?? service.website_url ?? '#';

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: service.name,
    alternateName: service.name_ar,
    url: localizedUrl(locale, `/services/${service.slug}`),
    ...(service.logo_url ? { logo: service.logo_url.startsWith('http') ? service.logo_url : `${localizedUrl('ar', '')}${service.logo_url}` } : {}),
    ...(service.total_reviews > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: service.rating.toFixed(1), reviewCount: service.total_reviews, bestRating: 5, worstRating: 1 } }
      : {}),
  };

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: tn('home'), url: localizedUrl(locale, '/') },
            { name: tn('services'), url: localizedUrl(locale, '/services') },
            { name, url: localizedUrl(locale, `/services/${service.slug}`) },
          ]),
          productJsonLd,
          ...(faqItems.length ? [faqJsonLd(faqItems)] : []),
        ]}
      />
      <ServiceHeader service={service} crumbs={[{ label: tn('services'), href: '/services' }, { label: name }]} title={name} subtitle={description} affiliateUrl={affiliateUrl} />

      <section className="section bg-surface">
        <div className="container-content space-y-10">
          <ProsCons service={service} />

          <div>
            <h2 className="section-title">{t('ratesTitle', { service: name })}</h2>
            <p className="section-subtitle">{t('ratesSubtitle')}</p>
            <ServiceRatesTable rows={rows} serviceSlug={service.slug} className="mt-6" caption={t('ratesTitle', { service: name })} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-navy">{t('supportedCountries')}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {rows.map(({ corridor }) => (
                <li key={corridor.id}>
                  <Link href={`/send-money/${currencyToSlug(corridor.send_currency)}/${service.slug}`} className="inline-flex items-center gap-2 rounded-pill border border-card-border bg-white px-3 py-1.5 text-small font-semibold text-navy transition hover:border-primary hover:text-primary-700">
                    <CountryFlag emoji={corridor.flag_emoji} label={corridor.send_country} size="sm" />
                    {locale === 'ar' ? corridor.send_country_ar : corridor.send_country}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-content">
          <div className="flex items-end justify-between gap-4">
            <h2 className="section-title">{t('reviewsTitle')}</h2>
            <Link href={`/reviews/write?service=${service.slug}`} className="btn-primary shrink-0">
              {t('writeReview')}
            </Link>
          </div>
          {reviews.length > 0 && <ReviewStats stats={stats} className="mt-6" />}
          <ReviewList reviews={reviews} showService={false} className="mt-6" emptyHref={`/reviews/write?service=${service.slug}`} />
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="section bg-surface">
          <div className="container-content grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <h2 className="section-title">{t('faqTitle', { service: name })}</h2>
              <FaqAccordion faqs={faqs.slice(0, 6)} className="mt-6" defaultOpenFirst />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy">{t('similar')}</h2>
              <ul className="mt-4 space-y-4">
                {similar.map((s) => (
                  <li key={s.id}>
                    <ServiceListCard service={s} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="section bg-white">
        <div className="container-content">
          <CTABanner />
        </div>
      </section>
    </>
  );
}
