import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LegalPage } from '@/components/shared/LegalPage';
import { PRIVACY_AR, PRIVACY_EN } from '@/lib/data/legal';
import { buildMetadata } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

type Props = { params: { locale: Locale } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  const tl = await getTranslations({ locale, namespace: 'legal' });
  return buildMetadata({ locale, path: '/privacy', title: t('privacyTitle'), description: tl('privacyTitle') });
}

export default async function PrivacyPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = await getTranslations('legal');
  return <LegalPage title={t('privacyTitle')} markdown={locale === 'ar' ? PRIVACY_AR : PRIVACY_EN} path="/privacy" />;
}
