import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { CorridorRateSummary } from '@/lib/api/rates';
import { CorridorGrid } from './CorridorGrid';

export async function PopularCorridors({ summaries }: { summaries: CorridorRateSummary[] }) {
  const t = await getTranslations('home');
  const tc = await getTranslations('common');
  const locale = (await getLocale()) as 'ar' | 'en';
  return (
    <section className="section" aria-labelledby="corridors-title">
      <div className="container-content">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="corridors-title" className="section-title">
              {t('corridorsTitle')}
            </h2>
            <p className="section-subtitle">{t('corridorsSubtitle')}</p>
          </div>
          <Link href="/send-money" className="btn-ghost shrink-0 text-primary-700">
            {tc('seeAll')} →
          </Link>
        </div>
        <CorridorGrid summaries={summaries.slice(0, 8)} className="mt-8" locale={locale} />
      </div>
    </section>
  );
}
