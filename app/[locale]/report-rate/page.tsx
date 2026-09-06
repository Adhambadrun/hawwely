import type { Metadata } from 'next';
import { Award, Clock3, Users } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ReportRateForm } from '@/components/shared/ReportRateForm';
import { PageHeader } from '@/components/shared/PageHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { getServices } from '@/lib/api/services';
import { getCorridors } from '@/lib/api/corridors';
import { getAllRates } from '@/lib/api/rates';
import { buildMetadata } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

export const revalidate = 1800;

type Props = { params: { locale: Locale } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  return buildMetadata({ locale, path: '/report-rate', title: t('reportTitle'), description: t('reportDescription') });
}

export default async function ReportRatePage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const [t, services, corridors, { rates }] = await Promise.all([getTranslations('report'), getServices(), getCorridors(), getAllRates()]);
  const currentRates = Object.fromEntries(rates.map((r) => [`${r.service_id}:${r.corridor_id}`, r.exchange_rate]));
  const why = [
    { icon: Clock3, text: t('why1') },
    { icon: Users, text: t('why2') },
    { icon: Award, text: t('why3') },
  ];

  return (
    <>
      <PageHeader title={`🚩 ${t('title')}`} subtitle={t('subtitle')} eyebrow={<Breadcrumbs light items={[{ label: t('title') }]} />} />
      <section className="section bg-surface">
        <div className="container-content grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <ReportRateForm services={services} corridors={corridors} currentRates={currentRates} />
          <aside className="card p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-navy">{t('whyTitle')}</h2>
            <ul className="mt-4 space-y-4">
              {why.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-small text-content">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="pt-1.5">{text}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
