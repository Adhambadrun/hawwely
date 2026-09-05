import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Analytics } from '@vercel/analytics/react';
import { routing, isLocale, isRtl } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloat } from '@/components/shared/WhatsAppFloat';
import { Toaster } from '@/components/ui/Toast';
import { JsonLd } from '@/components/shared/JsonLd';
import { OfflineBanner } from '@/components/shared/OfflineBanner';
import { UmamiScript } from '@/components/shared/UmamiScript';
import { ORGANIZATION_JSONLD, buildMetadata, websiteJsonLd } from '@/lib/seo';
import { APP_URL } from '@/lib/utils/constants';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: 'seo' });
  const base = buildMetadata({ locale, path: '/', title: t('homeTitle'), description: t('homeDescription') });
  return {
    metadataBase: new URL(APP_URL),
    ...base,
    title: {
      default: t('homeTitle'),
      template: locale === 'ar' ? '%s | حوّلي' : '%s | Hawwely',
    },
    applicationName: 'Hawwely',
    manifest: '/manifest.json',
    appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: locale === 'ar' ? 'حوّلي' : 'Hawwely' },
    icons: {
      icon: [
        { url: '/icons/favicon.ico', sizes: 'any' },
        { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
    },
    keywords:
      locale === 'ar'
        ? ['تحويل فلوس لمصر', 'سعر الريال', 'سعر الدرهم', 'أرخص تحويل', 'Wise مصر', 'ويسترن يونيون', 'تحويل الراجحي', 'مغتربين']
        : ['send money to Egypt', 'SAR to EGP', 'AED to EGP', 'remittance comparison', 'Wise Egypt', 'Western Union Egypt'],
    category: 'finance',
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#00C853' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function LocaleLayout({ children, params: { locale } }: { children: ReactNode; params: { locale: string } }) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations('app');
  const dir = isRtl(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="preload" href={locale === 'ar' ? '/fonts/cairo-arabic-wght-normal.woff2' : '/fonts/inter-latin-wght-normal.woff2'} as="font" type="font/woff2" crossOrigin="anonymous" />
        <JsonLd data={[ORGANIZATION_JSONLD, websiteJsonLd(locale)]} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider messages={messages} locale={locale} timeZone="Africa/Cairo">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[200] focus:rounded-btn focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
            {t('skipToContent')}
          </a>
          <OfflineBanner />
          <Header />
          <main id="main-content" className="flex-1 animate-fade-in">
            {children}
          </main>
          <Footer />
          <WhatsAppFloat />
          <Toaster />
        </NextIntlClientProvider>
        <Analytics />
        <UmamiScript />
      </body>
    </html>
  );
}
