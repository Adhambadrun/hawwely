import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { FaqBrowser } from '@/components/shared/FaqBrowser';
import { PageHeader } from '@/components/shared/PageHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { JsonLd } from '@/components/shared/JsonLd';
import { getFaqs } from '@/lib/api/content';
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, localizedUrl } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

export const revalidate = 3600;

type Props = { params: { locale: Locale } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  return buildMetadata({ locale, path: '/faq', title: t('faqTitle'), description: t('faqDescription') });
}

export default async function FaqPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const [t, tn, faqs] = await Promise.all([getTranslations('faq'), getTranslations('nav'), getFaqs()]);
  const items = faqs.map((f) => ({ question: locale === 'ar' ? f.question_ar : f.question, answer: locale === 'ar' ? f.answer_ar : f.answer }));

  return (
    <>
      <JsonLd
        data={[
          faqJsonLd(items),
          breadcrumbJsonLd([
            { name: tn('home'), url: localizedUrl(locale, '/') },
            { name: t('title'), url: localizedUrl(locale, '/faq') },
          ]),
        ]}
      />
      <PageHeader title={t('title')} subtitle={t('subtitle')} eyebrow={<Breadcrumbs light items={[{ label: t('title') }]} />} />
      <section className="section bg-surface">
        <div className="container-content max-w-4xl">
          <FaqBrowser faqs={faqs} />
          <div className="card mt-12 flex flex-col items-center gap-4 p-8 text-center md:flex-row md:justify-between md:text-start">
            <div>
              <h2 className="text-xl font-bold text-navy">{t('stillQuestions')}</h2>
              <p className="mt-1 text-small text-content-secondary">{t('contactUs')}</p>
            </div>
            <Link href="/contact" className="btn-primary shrink-0">
              {t('contactButton')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
