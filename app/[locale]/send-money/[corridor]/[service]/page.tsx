import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ServiceHeader } from '@/components/services/ServiceHeader';
import { ProsCons } from '@/components/services/ProsCons';
import { ServiceCorridorExample } from '@/components/services/ServiceCorridorExample';
import { RateChart } from '@/components/rates/RateChart';
import { ReviewList } from '@/components/reviews/ReviewList';
import { FaqAccordion } from '@/components/shared/FaqAccordion';
import { JsonLd } from '@/components/shared/JsonLd';
import { CTABanner } from '@/components/shared/CTABanner';
import { ServiceLogo } from '@/components/compare/ServiceLogo';
import { getCorridors, resolveCorridor } from '@/lib/api/corridors';
import { getServiceBySlug, getServices } from '@/lib/api/services';
import { compareCorridor, getRateHistory, getRatesForCorridor } from '@/lib/api/rates';
import { getFaqs, getReviews } from '@/lib/api/content';
import { buildAffiliateUrl } from '@/lib/utils/affiliate';
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, localizedUrl } from '@/lib/seo';
import { currencyToSlug, RATES_REVALIDATE_SECONDS } from '@/lib/utils/constants';
import { formatPercent, formatRate } from '@/lib/utils/formatters';
import type { Locale } from '@/i18n/routing';

export const revalidate = RATES_REVALIDATE_SECONDS;
export const dynamicParams = true;

type Props = { params: { locale: Locale; corridor: string; service: string } };

export async function generateStaticParams() {
  const [corridors, services] = await Promise.all([getCorridors(), getServices()]);
  const params: { corridor: string; service: string }[] = [];
  for (const c of corridors) {
    const code = `${c.send_currency}-EGP`;
    for (const s of services) {
      if (s.supported_corridors.includes(code as never)) params.push({ corridor: currencyToSlug(c.send_currency), service: s.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params: { locale, corridor: cslug, service: sslug } }: Props): Promise<Metadata> {
  const [corridor, service] = await Promise.all([resolveCorridor(cslug), getServiceBySlug(sslug)]);
  if (!corridor || !service) notFound();
  const t = await getTranslations({ locale, namespace: 'seo' });
  const tc = await getTranslations({ locale, namespace: 'corridor' });
  const country = locale === 'ar' ? corridor.send_country_ar : corridor.send_country;
  const name = locale === 'ar' ? service.name_ar : service.name;
  return buildMetadata({
    locale,
    path: `/send-money/${currencyToSlug(corridor.send_currency)}/${service.slug}`,
    title: t('corridorServiceTitle', { service: name, country, year: new Date().getFullYear() }),
    description: tc('serviceInCorridorSubtitle', { currency: corridor.send_currency, service: name }),
  });
}

export default async function CorridorServicePage({ params: { locale, corridor: cslug, service: sslug } }: Props) {
  setRequestLocale(locale);
  const [corridor, service] = await Promise.all([resolveCorridor(cslug), getServiceBySlug(sslug)]);
  if (!corridor || !service) notFound();
  const code = `${corridor.send_currency}-EGP`;
  if (!service.supported_corridors.includes(code as never)) notFound();

  const [t, tn, tsv, tr, { rates }, history, midHistory, reviews, faqs, ...comparisons] = await Promise.all([
    getTranslations('corridor'),
    getTranslations('nav'),
    getTranslations('services'),
    getTranslations('rates'),
    getRatesForCorridor(corridor),
    getRateHistory(corridor, 30, service.id),
    getRateHistory(corridor, 30),
    getReviews({ serviceId: service.id, corridorId: corridor.id, limit: 4 }),
    getFaqs({ serviceId: service.id, corridorId: corridor.id }),
    compareCorridor(corridor.send_currency, 1000),
    compareCorridor(corridor.send_currency, 2000),
    compareCorridor(corridor.send_currency, 5000),
  ]);

  const country = locale === 'ar' ? corridor.send_country_ar : corridor.send_country;
  const name = locale === 'ar' ? service.name_ar : service.name;
  const corridorSlug = currencyToSlug(corridor.send_currency);
  const path = `/send-money/${corridorSlug}/${service.slug}`;
  const rate = rates.find((r) => r.service_id === service.id);
  const examples = [1000, 2000, 5000].map((amount, i) => ({ amount, data: comparisons[i] })).filter((e): e is { amount: number; data: NonNullable<(typeof comparisons)[number]> } => !!e.data);
  const affiliateUrl = buildAffiliateUrl(service, code) ?? service.website_url ?? '#';
  const otherServices = rates.filter((r) => r.service_id !== service.id).sort((a, b) => b.exchange_rate - a.exchange_rate).slice(0, 6);
  const faqItems = faqs.slice(0, 5).map((f) => ({ question: locale === 'ar' ? f.question_ar : f.question, answer: locale === 'ar' ? f.answer_ar : f.answer }));
  const serviceReviews = reviews.length ? reviews : await getReviews({ serviceId: service.id, limit: 4 });

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: tn('home'), url: localizedUrl(locale, '/') },
            { name: tn('sendMoney'), url: localizedUrl(locale, '/send-money') },
            { name: country, url: localizedUrl(locale, `/send-money/${corridorSlug}`) },
            { name, url: localizedUrl(locale, path) },
          ]),
          ...(faqItems.length ? [faqJsonLd(faqItems)] : []),
        ]}
      />
      <ServiceHeader
        service={service}
        crumbs={[{ label: tn('sendMoney'), href: '/send-money' }, { label: country, href: `/send-money/${corridorSlug}` }, { label: name }]}
        title={t('serviceInCorridor', { country, service: name })}
        subtitle={t('serviceInCorridorSubtitle', { currency: corridor.send_currency, service: name })}
        corridorId={corridor.id}
        amount={2000}
        affiliateUrl={affiliateUrl}
      />

      <section className="section bg-surface">
        <div className="container-content space-y-8">
          {rate && (
            <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: tsv('rateColumn'), value: formatRate(rate.exchange_rate, locale), tone: 'text-navy' },
                { label: tsv('markupColumn'), value: formatPercent(rate.markup_percent, locale), tone: rate.markup_percent <= 0.5 ? 'text-primary-700' : 'text-danger' },
                { label: tsv('fee'), value: `${rate.fixed_fee} ${rate.fee_currency}${rate.percent_fee ? ` + ${formatPercent(rate.percent_fee, locale)}` : ''}`, tone: 'text-navy' },
                { label: t('midMarketNow'), value: formatRate(rate.mid_market_rate, locale), tone: 'text-content-secondary' },
              ].map((c) => (
                <div key={c.label} className="card p-4">
                  <dt className="text-caption text-content-secondary">{c.label}</dt>
                  <dd className={`num mt-1 text-xl font-extrabold ${c.tone}`} dir="ltr">
                    {c.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {examples.length > 0 && <ServiceCorridorExample serviceId={service.id} examples={examples} />}

          <ProsCons service={service} />

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="card p-5 md:p-6">
              <h2 className="text-lg font-bold text-navy">{tr('historyTitle', { pair: `${corridor.send_currency}/EGP` })}</h2>
              <p className="mt-1 text-caption text-content-secondary">{tr('viaService', { service: name })}</p>
              <RateChart
                points={midHistory.map((p, i) => ({ ...p, exchange_rate: history[i]?.exchange_rate ?? p.exchange_rate }))}
                currency={corridor.send_currency}
                showService
                serviceName={name}
                height={260}
                className="mt-4"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy">{tsv('faqTitle', { service: name })}</h2>
              <FaqAccordion faqs={faqs.slice(0, 5)} className="mt-4" defaultOpenFirst />
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-content">
          <div className="flex items-end justify-between gap-4">
            <h2 className="section-title">{t('compareOthers')}</h2>
            <Link href={`/send-money/${corridorSlug}`} className="btn-outline shrink-0">
              {t('explore')}
            </Link>
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherServices.map((r) => (
              <li key={r.id}>
                <Link href={`/send-money/${corridorSlug}/${r.service.slug}`} className="card card-hover flex items-center gap-3 p-4">
                  <ServiceLogo src={r.service.logo_url} name={r.service.name} size={40} brandColor={r.service.brand_color} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-navy">{locale === 'ar' ? r.service.name_ar : r.service.name}</p>
                    <p className="num text-caption text-content-secondary" dir="ltr">
                      {formatRate(r.exchange_rate, locale)} · {formatPercent(r.markup_percent, locale)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-surface">
        <div className="container-content">
          <h2 className="section-title">{tsv('reviewsTitle')}</h2>
          <ReviewList reviews={serviceReviews} showService={false} className="mt-6" />
          <CTABanner className="mt-12" href={`/send-money/${corridorSlug}`} />
        </div>
      </section>
    </>
  );
}
