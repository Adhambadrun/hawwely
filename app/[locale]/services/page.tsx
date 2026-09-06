import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ServicesDirectory } from '@/components/services/ServicesDirectory';
import { PageHeader } from '@/components/shared/PageHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { CTABanner } from '@/components/shared/CTABanner';
import { JsonLd } from '@/components/shared/JsonLd';
import { getServices } from '@/lib/api/services';
import { getCorridors } from '@/lib/api/corridors';
import { compareCorridor } from '@/lib/api/rates';
import { breadcrumbJsonLd, buildMetadata, localizedUrl } from '@/lib/seo';
import { DEFAULT_AMOUNT, RATES_REVALIDATE_SECONDS } from '@/lib/utils/constants';
import type { Locale } from '@/i18n/routing';

export const revalidate = RATES_REVALIDATE_SECONDS;

type Props = { params: { locale: Locale } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  return buildMetadata({ locale, path: '/services', title: t('servicesTitle'), description: t('servicesDescription') });
}

export default async function ServicesPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const [t, tn, services, corridors] = await Promise.all([getTranslations('services'), getTranslations('nav'), getServices(), getCorridors()]);

  // Which services are cheapest / fastest in at least one corridor (used for the filter chips).
  const comparisons = await Promise.all(corridors.slice(0, 6).map((c) => compareCorridor(c.send_currency, DEFAULT_AMOUNT)));
  const cheapest = new Set<string>();
  const fastest = new Set<string>();
  for (const c of comparisons) {
    if (!c) continue;
    c.results.slice(0, 3).forEach((r) => cheapest.add(r.service.slug));
    c.results.filter((r) => r.is_fastest || r.transfer_speed_minutes <= 60).forEach((r) => fastest.add(r.service.slug));
  }

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tn('home'), url: localizedUrl(locale, '/') },
          { name: tn('services'), url: localizedUrl(locale, '/services') },
        ])}
      />
      <PageHeader title={t('title')} subtitle={t('subtitle')} eyebrow={<Breadcrumbs light items={[{ label: tn('services') }]} />} />
      <section className="section bg-surface">
        <div className="container-content">
          <ServicesDirectory services={services} cheapestSlugs={[...cheapest]} fastestSlugs={[...fastest]} />
          <CTABanner className="mt-12" />
        </div>
      </section>
    </>
  );
}
