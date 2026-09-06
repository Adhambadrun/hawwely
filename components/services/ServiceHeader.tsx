import { BadgeCheck, Building2, CalendarDays, ExternalLink, ShieldCheck } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { ServiceLogo } from '@/components/compare/ServiceLogo';
import { PayoutMethods } from '@/components/compare/PayoutMethodBadge';
import { SendButton } from '@/components/compare/SendButton';
import { StarRating } from '@/components/ui/StarRating';
import { Breadcrumbs, type Crumb } from '@/components/shared/Breadcrumbs';
import type { Service } from '@/lib/types';
import { formatNumber } from '@/lib/utils/formatters';

export async function ServiceHeader({ service, crumbs, title, subtitle, corridorId, amount, affiliateUrl }: { service: Service; crumbs: Crumb[]; title: string; subtitle: string; corridorId?: string | null; amount?: number | null; affiliateUrl: string }) {
  const t = await getTranslations('services');
  const ts = await getTranslations('sendMethod');
  const locale = (await getLocale()) as 'ar' | 'en';
  const name = locale === 'ar' ? service.name_ar : service.name;

  return (
    <section className="relative overflow-hidden bg-navy-gradient text-white">
      <div className="hero-dots absolute inset-0 opacity-60" aria-hidden />
      <div className="container-content relative py-10 md:py-14">
        <Breadcrumbs light items={crumbs} />
        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white p-2 shadow-card">
                <ServiceLogo src={service.logo_url} name={service.name} size={64} brandColor={service.brand_color} />
              </div>
              <div className="min-w-0">
                <h1 className="text-balance text-hero-m font-extrabold md:text-4xl">{title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-white/80">
                  <span className="inline-flex items-center gap-2">
                    <StarRating value={service.rating} size="sm" />
                    <span className="num font-bold text-white">{service.rating.toFixed(1)}</span>
                    <span>{t('reviews', { count: formatNumber(service.total_reviews, locale) })}</span>
                  </span>
                  {service.is_featured && (
                    <span className="inline-flex items-center gap-1 text-gold">
                      <BadgeCheck className="h-4 w-4" aria-hidden />
                      {t('featured')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-5 max-w-2xl text-body text-white/85">{subtitle}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-small sm:grid-cols-3">
              {service.founded_year && (
                <div className="flex items-start gap-2">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" aria-hidden />
                  <div>
                    <dt className="text-caption text-white/60">{t('founded')}</dt>
                    <dd className="num font-semibold">{service.founded_year}</dd>
                  </div>
                </div>
              )}
              {service.headquarters && (
                <div className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" aria-hidden />
                  <div>
                    <dt className="text-caption text-white/60">{t('headquarters')}</dt>
                    <dd className="font-semibold">{(locale === 'ar' && service.headquarters_ar) || service.headquarters}</dd>
                  </div>
                </div>
              )}
              {service.license_info && (
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" aria-hidden />
                  <div>
                    <dt className="text-caption text-white/60">{t('license')}</dt>
                    <dd className="font-semibold">{(locale === 'ar' && service.license_info_ar) || service.license_info}</dd>
                  </div>
                </div>
              )}
            </dl>
          </div>

          <aside className="rounded-card border border-white/10 bg-white/10 p-5 backdrop-blur">
            <p className="text-caption font-semibold uppercase tracking-wide text-white/60">{t('payoutMethods')}</p>
            <PayoutMethods methods={service.payout_methods} className="mt-2 [&_span]:border-white/30 [&_span]:text-white" />
            <p className="mt-4 text-caption font-semibold uppercase tracking-wide text-white/60">{t('sendMethods')}</p>
            <p className="mt-1 text-small text-white/90">{service.send_methods.map((m) => ts(m)).join(' · ')}</p>
            <SendButton serviceId={service.id} serviceName={name} corridorId={corridorId} amount={amount} fallbackUrl={affiliateUrl} size="lg" fullWidth className="mt-5" label={t('sendWith', { service: name })} />
            {service.website_url && (
              <a href={service.website_url} target="_blank" rel="noopener noreferrer nofollow" className="mt-3 inline-flex items-center gap-1 text-caption text-white/70 hover:text-white">
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                {t('visitWebsite')}
              </a>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
