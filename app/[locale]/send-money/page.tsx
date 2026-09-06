import type { Metadata } from 'next';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { CorridorGrid } from '@/components/corridors/CorridorGrid';
import { PageHeader } from '@/components/shared/PageHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { CTABanner } from '@/components/shared/CTABanner';
import { JsonLd } from '@/components/shared/JsonLd';
import { getCorridorSummaries } from '@/lib/api/rates';
import { breadcrumbJsonLd, buildMetadata, localizedUrl } from '@/lib/seo';
import { RATES_REVALIDATE_SECONDS } from '@/lib/utils/constants';
import { formatDateTime } from '@/lib/utils/formatters';
import type { Locale } from '@/i18n/routing';

export const revalidate = RATES_REVALIDATE_SECONDS;

type Props = { params: { locale: Locale } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  return buildMetadata({ locale, path: '/send-money', title: t('sendMoneyTitle'), description: t('sendMoneyDescription') });
}

export default async function SendMoneyIndexPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const [t, tn, tc, { summaries, updatedAt }] = await Promise.all([getTranslations('corridor'), getTranslations('nav'), getTranslations('common'), getCorridorSummaries()]);
  const lc = (await getLocale()) as 'ar' | 'en';

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tn('home'), url: localizedUrl(locale, '/') },
          { name: tn('sendMoney'), url: localizedUrl(locale, '/send-money') },
        ])}
      />
      <PageHeader title={t('allTitle')} subtitle={t('allSubtitle')} eyebrow={<Breadcrumbs light items={[{ label: tn('sendMoney') }]} />} />
      <section className="section bg-surface">
        <div className="container-content">
          <p className="mb-6 text-caption text-content-secondary">{tc('lastUpdated', { time: formatDateTime(updatedAt, lc) })}</p>
          <CorridorGrid summaries={summaries} variant="detailed" locale={lc} />
          <CTABanner className="mt-12" />
        </div>
      </section>
    </>
  );
}
