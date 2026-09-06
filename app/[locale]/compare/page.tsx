import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ComparePageClient } from '@/components/compare/ComparePageClient';
import { ResultsSkeleton } from '@/components/ui/Skeleton';
import { JsonLd } from '@/components/shared/JsonLd';
import { getCorridors } from '@/lib/api/corridors';
import { compareCorridor, getAllRates } from '@/lib/api/rates';
import { breadcrumbJsonLd, buildMetadata, localizedUrl } from '@/lib/seo';
import { DEFAULT_AMOUNT, DEFAULT_SEND_CURRENCY, RATES_REVALIDATE_SECONDS } from '@/lib/utils/constants';
import type { Locale } from '@/i18n/routing';

export const revalidate = RATES_REVALIDATE_SECONDS;

type Props = { params: { locale: Locale } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  return buildMetadata({ locale, path: '/compare', title: t('compareTitle'), description: t('compareDescription') });
}

export default async function ComparePage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations('seo');
  const tn = await getTranslations('nav');
  // Static (ISR) shell with the default comparison; the client applies ?from=&amount=&payout=.
  const [corridors, { updatedAt }, initial] = await Promise.all([getCorridors(), getAllRates(), compareCorridor(DEFAULT_SEND_CURRENCY, DEFAULT_AMOUNT)]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tn('home'), url: localizedUrl(locale, '/') },
          { name: tn('compare'), url: localizedUrl(locale, '/compare') },
        ])}
      />
      <section className="bg-navy-gradient text-white">
        <div className="container-content py-10 md:py-14">
          <h1 className="text-hero-m font-extrabold md:text-4xl">{t('compareTitle')}</h1>
          <p className="mt-3 max-w-2xl text-body text-white/80">{t('compareDescription')}</p>
        </div>
      </section>
      <section className="section bg-surface">
        <div className="container-content">
          <Suspense fallback={<ResultsSkeleton count={5} />}>
            <ComparePageClient corridors={corridors} initial={initial} lastUpdated={updatedAt} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
