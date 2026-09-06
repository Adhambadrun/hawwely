import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LegalPage } from '@/components/shared/LegalPage';
import { TERMS_AR, TERMS_EN } from '@/lib/data/legal';
import { buildMetadata } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

type Props = { params: { locale: Locale } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  const tl = await getTranslations({ locale, namespace: 'legal' });
  return buildMetadata({ locale, path: '/terms', title: t('termsTitle'), description: tl('termsTitle') });
}

export default async function TermsPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations('legal');
  return <LegalPage title={t('termsTitle')} markdown={locale === 'ar' ? TERMS_AR : TERMS_EN} path="/terms" />;
}
