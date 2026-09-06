import type { Metadata } from 'next';
import { Eye, HeartHandshake, Languages, Mail } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { CTABanner } from '@/components/shared/CTABanner';
import { JsonLd } from '@/components/shared/JsonLd';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { LogoMark } from '@/components/shared/Logo';
import { getServices } from '@/lib/api/services';
import { getCorridors } from '@/lib/api/corridors';
import { breadcrumbJsonLd, buildMetadata, localizedUrl, ORGANIZATION_JSONLD } from '@/lib/seo';
import { SITE_STATS } from '@/lib/data/stats';
import type { Locale } from '@/i18n/routing';

type Props = { params: { locale: Locale } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  return buildMetadata({ locale, path: '/about', title: t('aboutTitle'), description: t('aboutDescription') });
}

export default async function AboutPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const [t, tn, services, corridors] = await Promise.all([getTranslations('about'), getTranslations('nav'), getServices(), getCorridors()]);
  const values = [
    { icon: Eye, title: t('value1Title'), text: t('value1Text') },
    { icon: HeartHandshake, title: t('value2Title'), text: t('value2Text') },
    { icon: Languages, title: t('value3Title'), text: t('value3Text') },
  ];
  const stats = [
    { value: SITE_STATS.comparisons, label: t('statsUsers'), suffix: '+' },
    { value: SITE_STATS.savedEgp, label: t('statsSaved'), suffix: '+' },
    { value: services.length, label: t('statsServices'), suffix: '' },
    { value: corridors.length, label: t('statsCountries'), suffix: '' },
  ];

  return (
    <>
      <JsonLd
        data={[
          ORGANIZATION_JSONLD,
          breadcrumbJsonLd([
            { name: tn('home'), url: localizedUrl(locale, '/') },
            { name: t('title'), url: localizedUrl(locale, '/about') },
          ]),
        ]}
      />
      <PageHeader title={t('title')} subtitle={t('subtitle')} eyebrow={<Breadcrumbs light items={[{ label: t('title') }]} />} />

      <section className="section bg-surface">
        <div className="container-content">
          <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="card p-5 text-center">
                <dd className="num text-3xl font-extrabold text-primary-700" dir="ltr">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </dd>
                <dt className="mt-1 text-small text-content-secondary">{s.label}</dt>
              </div>
            ))}
          </dl>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
            <div className="space-y-10">
              <article>
                <h2 className="section-title">{t('missionTitle')}</h2>
                <div className="mt-4 space-y-4 text-body leading-relaxed text-content">
                  <p>{t('missionText1')}</p>
                  <p>{t('missionText2')}</p>
                  <p className="rounded-card border-s-4 border-primary bg-white p-4 font-semibold text-navy shadow-card">{t('missionText3')}</p>
                </div>
              </article>

              <article>
                <h2 className="section-title">{t('moneyTitle')}</h2>
                <div className="mt-4 space-y-4 text-body leading-relaxed text-content">
                  <p>{t('moneyText1')}</p>
                  <p>{t('moneyText2')}</p>
                </div>
              </article>

              <article>
                <h2 className="section-title">{t('valuesTitle')}</h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                  {values.map(({ icon: Icon, title, text }) => (
                    <li key={title} className="card p-5">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <h3 className="mt-4 font-bold text-navy">{title}</h3>
                      <p className="mt-1 text-small text-content-secondary">{text}</p>
                    </li>
                  ))}
                </ul>
              </article>

              <article>
                <h2 className="section-title">{t('teamTitle')}</h2>
                <p className="mt-4 text-body leading-relaxed text-content">{t('teamText')}</p>
                <div className="card mt-6 flex items-center gap-4 p-5">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-navy">
                    <LogoMark className="h-9 w-9" />
                  </span>
                  <div>
                    <p className="font-bold text-navy">{t('founderName')}</p>
                    <p className="text-caption font-semibold text-primary-700">{t('founderRole')}</p>
                    <p className="mt-1 text-small text-content-secondary">{t('founderBio')}</p>
                  </div>
                </div>
              </article>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div className="card p-6">
                <h2 className="text-lg font-bold text-navy">{t('contactTitle')}</h2>
                <p className="mt-2 text-small text-content-secondary">{t('contactText')}</p>
                <Link href="/contact" className="btn-primary mt-4 w-full">
                  <Mail className="h-4 w-4" aria-hidden />
                  {tn('contact')}
                </Link>
              </div>
              <div className="card p-6">
                <h2 className="text-lg font-bold text-navy">{t('pressTitle')}</h2>
                <p className="mt-2 text-small text-content-secondary">{t('pressText')}</p>
              </div>
            </aside>
          </div>

          <CTABanner className="mt-14" />
        </div>
      </section>
    </>
  );
}
