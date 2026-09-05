import { Quote } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { StarRating } from '@/components/ui/StarRating';
import { ServiceLogo } from '@/components/compare/ServiceLogo';
import type { Service, Testimonial } from '@/lib/types';
import { formatNumber } from '@/lib/utils/formatters';

export async function TrustSection({ testimonials, services, stats }: { testimonials: Testimonial[]; services: Service[]; stats: { comparisons: number; countries: number; services: number; savedEgp: number } }) {
  const t = await getTranslations('home');
  const locale = (await getLocale()) as 'ar' | 'en';
  const counters = [
    { value: stats.comparisons, label: t('statsComparisons'), suffix: '+' },
    { value: stats.countries, label: t('statsCountries'), suffix: '' },
    { value: stats.services, label: t('statsServices'), suffix: '' },
    { value: stats.savedEgp, label: t('statsSaved'), suffix: '+' },
  ];

  return (
    <section className="section bg-white" aria-labelledby="trust-title">
      <div className="container-content">
        <div className="text-center">
          <h2 id="trust-title" className="section-title">
            {t('trustTitle')}
          </h2>
          <p className="section-subtitle mx-auto">{t('trustSubtitle')}</p>
        </div>

        <div className="mt-10 rounded-2xl border border-primary/20 bg-primary-50/60 p-6 text-center md:p-8">
          <p className="text-body font-semibold text-navy">{t('trustCounterPrefix')}</p>
          <p className="num mt-1 text-4xl font-extrabold text-primary-700 md:text-5xl" dir="ltr">
            <AnimatedCounter value={stats.savedEgp} durationMs={2000} />
          </p>
          <p className="mt-1 text-body font-semibold text-navy">{t('trustCounterSuffix')}</p>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {counters.map((c) => (
            <div key={c.label} className="card p-5 text-center">
              <dd className="num text-3xl font-extrabold text-navy" dir="ltr">
                <AnimatedCounter value={c.value} suffix={c.suffix} />
              </dd>
              <dt className="mt-1 text-small text-content-secondary">{c.label}</dt>
            </div>
          ))}
        </dl>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.slice(0, 3).map((tm, i) => (
            <li key={tm.id} className="card relative flex flex-col p-6 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <Quote className="absolute end-5 top-5 h-8 w-8 text-primary/20" aria-hidden />
              <StarRating value={tm.rating} size="sm" />
              <p className="mt-4 flex-1 text-body leading-relaxed text-content-primary">“{locale === 'ar' ? tm.text_ar : tm.text}”</p>
              <div className="mt-5 flex items-center gap-3 border-t border-card-border pt-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold text-white" style={{ backgroundColor: tm.avatar_color }} aria-hidden>
                  {(locale === 'ar' ? tm.name_ar : tm.name).charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-navy">{locale === 'ar' ? tm.name_ar : tm.name}</p>
                  <p className="truncate text-caption text-content-secondary">{locale === 'ar' ? tm.location_ar : tm.location}</p>
                </div>
                <span className="badge badge-success shrink-0">{t('trustSaved', { amount: formatNumber(tm.savings_egp, locale) })}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <p className="text-center text-small font-semibold text-content-secondary">{t('trustCompared')}</p>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {services.map((s) => (
              <li key={s.id} className="flex items-center gap-2 rounded-pill border border-card-border bg-white px-3 py-1.5 shadow-sm">
                <ServiceLogo src={s.logo_url} name={s.name} size={24} brandColor={s.brand_color} />
                <span className="text-small font-semibold text-navy">{locale === 'ar' ? s.name_ar : s.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
