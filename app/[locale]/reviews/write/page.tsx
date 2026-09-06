import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { PageHeader } from '@/components/shared/PageHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { getServices } from '@/lib/api/services';
import { getCorridors } from '@/lib/api/corridors';
import { buildMetadata } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

type Props = { params: { locale: Locale }; searchParams: { service?: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  return buildMetadata({ locale, path: '/reviews/write', title: t('writeReviewTitle'), description: t('reviewsDescription'), noIndex: true });
}

export default async function WriteReviewPage({ params: { locale }, searchParams }: Props) {
  setRequestLocale(locale);
  const [t, services, corridors] = await Promise.all([getTranslations('reviews'), getServices(), getCorridors()]);
  const defaultService = services.find((s) => s.slug === searchParams.service)?.id;

  return (
    <>
      <PageHeader title={t('writeTitle')} subtitle={t('writeSubtitle')} eyebrow={<Breadcrumbs light items={[{ label: t('title'), href: '/reviews' }, { label: t('write') }]} />} />
      <section className="section bg-surface">
        <div className="container-content max-w-3xl">
          <ReviewForm services={services} corridors={corridors} defaultServiceId={defaultService} />
        </div>
      </section>
    </>
  );
}
