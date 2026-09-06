import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AlertsDashboard } from '@/components/alerts/AlertsDashboard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { JsonLd } from '@/components/shared/JsonLd';
import { Skeleton } from '@/components/ui/Skeleton';
import { getCorridors } from '@/lib/api/corridors';
import { getCorridorSummaries } from '@/lib/api/rates';
import { breadcrumbJsonLd, buildMetadata, localizedUrl } from '@/lib/seo';
import { RATES_REVALIDATE_SECONDS } from '@/lib/utils/constants';
import type { Locale } from '@/i18n/routing';

export const revalidate = RATES_REVALIDATE_SECONDS;

type Props = { params: { locale: Locale } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  return buildMetadata({ locale, path: '/alerts', title: t('alertsTitle'), description: t('alertsDescription') });
}

export default async function AlertsPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const [t, tn, corridors, { summaries }] = await Promise.all([getTranslations('alerts'), getTranslations('nav'), getCorridors(), getCorridorSummaries()]);
  const midRates = Object.fromEntries(summaries.map((s) => [s.corridor.send_currency, s.midMarketRate]));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tn('home'), url: localizedUrl(locale, '/') },
          { name: tn('alerts'), url: localizedUrl(locale, '/alerts') },
        ])}
      />
      <PageHeader title={`🔔 ${t('title')}`} subtitle={t('subtitle')} eyebrow={<Breadcrumbs light items={[{ label: tn('alerts') }]} />} />
      <section className="section bg-surface">
        <div className="container-content">
          <Suspense fallback={<Skeleton className="h-96" />}>
            <AlertsDashboard corridors={corridors} midRates={midRates} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
