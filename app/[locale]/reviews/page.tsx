import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ReviewsBrowser } from '@/components/reviews/ReviewsBrowser';
import { ReviewStats } from '@/components/reviews/ReviewStats';
import { PageHeader } from '@/components/shared/PageHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { JsonLd } from '@/components/shared/JsonLd';
import { getServices } from '@/lib/api/services';
import { getCorridors } from '@/lib/api/corridors';
import { computeReviewStats, getReviews } from '@/lib/api/content';
import { breadcrumbJsonLd, buildMetadata, localizedUrl } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

export const revalidate = 600;

type Props = { params: { locale: Locale } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  return buildMetadata({ locale, path: '/reviews', title: t('reviewsTitle'), description: t('reviewsDescription') });
}

export default async function ReviewsPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const [t, tn, reviews, services, corridors] = await Promise.all([getTranslations('reviews'), getTranslations('nav'), getReviews({ limit: 100 }), getServices(), getCorridors()]);
  const stats = computeReviewStats(reviews);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tn('home'), url: localizedUrl(locale, '/') },
          { name: t('title'), url: localizedUrl(locale, '/reviews') },
        ])}
      />
      <PageHeader title={t('title')} subtitle={t('subtitle')} eyebrow={<Breadcrumbs light items={[{ label: t('title') }]} />}>
        <Link href="/reviews/write" className="btn-primary btn-lg">
          ✍️ {t('write')}
        </Link>
      </PageHeader>
      <section className="section bg-surface">
        <div className="container-content space-y-8">
          {reviews.length > 0 && <ReviewStats stats={stats} />}
          <ReviewsBrowser reviews={reviews} services={services} corridors={corridors} />
        </div>
      </section>
    </>
  );
}
