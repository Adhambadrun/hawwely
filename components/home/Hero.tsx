import { getLocale, getTranslations } from 'next-intl/server';
import { ComparisonForm } from '@/components/compare/ComparisonForm';
import { TrustSignals } from '@/components/shared/TrustSignals';
import type { Corridor } from '@/lib/types';

export async function Hero({ corridors, lastUpdated, midMarketRate }: { corridors: Corridor[]; lastUpdated: string; midMarketRate: number }) {
  const t = await getTranslations('hero');
  const locale = await getLocale();
  const title = t('title');
  const highlight = t('titleHighlight');
  const [before, after] = title.includes(highlight) ? title.split(highlight) : [title, ''];

  return (
    <section className="relative overflow-hidden bg-navy-gradient text-white" aria-labelledby="hero-title">
      <div className="hero-dots absolute inset-0 animate-dots-drift opacity-70" aria-hidden />
      <div className="pointer-events-none absolute -start-32 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -end-24 bottom-0 h-80 w-80 rounded-full bg-gold/10 blur-3xl" aria-hidden />

      <div className="container-content relative grid items-center gap-10 py-14 md:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-pill border border-white/15 bg-white/10 px-3 py-1.5 text-caption font-semibold backdrop-blur">
            <span className="relative flex h-2.5 w-2.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <span className="text-red-300">{t('liveBadge')}</span>
            <span className="text-white/80">{t('liveText')}</span>
          </span>

          <h1 id="hero-title" className="mt-6 text-balance text-hero-m font-extrabold leading-tight md:text-hero">
            {before}
            {highlight && (
              <span className="relative inline-block text-primary-light">
                {highlight}
                <svg className="absolute -bottom-1 start-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden>
                  <path d="M2 9C50 3 150 3 198 9" stroke="#FFD700" strokeWidth="4" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            )}
            {after}
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-lg text-white/80">{t('subtitle')}</p>
          <TrustSignals className="mt-8" />
        </div>

        <div className="animate-fade-up animation-delay-200 lg:justify-self-end lg:w-full lg:max-w-md">
          <ComparisonForm corridors={corridors} lastUpdated={lastUpdated} midMarketRate={midMarketRate} />
          <p className="sr-only">{locale}</p>
        </div>
      </div>
    </section>
  );
}
