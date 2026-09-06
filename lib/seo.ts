import type { Metadata } from 'next';
import { APP_URL, APP_NAME, APP_NAME_AR } from '@/lib/utils/constants';
import type { Locale } from '@/i18n/routing';

/** Build a locale-aware absolute URL. Arabic lives at the root, English under /en. */
export function localizedUrl(locale: Locale, path = ''): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  const p = clean === '/' ? '' : clean;
  return locale === 'ar' ? `${APP_URL}${p || '/'}` : `${APP_URL}/en${p}`;
}

export interface PageMetaInput {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  noIndex?: boolean;
}

/** Shared metadata builder: canonical + hreflang alternates + OG + Twitter. */
export function buildMetadata({ locale, path, title, description, image, type = 'website', publishedTime, noIndex }: PageMetaInput): Metadata {
  const url = localizedUrl(locale, path);
  const ogImage = image ?? `${APP_URL}/images/og-image.png`;
  const siteName = locale === 'ar' ? `${APP_NAME_AR} | ${APP_NAME}` : `${APP_NAME} | ${APP_NAME_AR}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ar: localizedUrl('ar', path),
        en: localizedUrl('en', path),
        'x-default': localizedUrl('ar', path),
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      alternateLocale: locale === 'ar' ? ['en_US'] : ['ar_EG'],
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: APP_NAME,
  alternateName: APP_NAME_AR,
  url: APP_URL,
  logo: `${APP_URL}/icons/icon-512.png`,
  sameAs: ['https://facebook.com/hawwely', 'https://x.com/hawwely', 'https://instagram.com/hawwely', 'https://t.me/hawwely'],
};

export function websiteJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: locale === 'ar' ? `${APP_NAME_AR} — ${APP_NAME}` : APP_NAME,
    url: localizedUrl(locale, '/'),
    inLanguage: locale === 'ar' ? 'ar-EG' : 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${localizedUrl(locale, '/compare')}?from={from}&amount={amount}`,
      },
      'query-input': ['required name=from', 'required name=amount'],
    },
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}
