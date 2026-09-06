import { getLocale, getTranslations } from 'next-intl/server';
import { BlogContent } from '@/components/blog/BlogContent';
import { PageHeader } from '@/components/shared/PageHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { JsonLd } from '@/components/shared/JsonLd';
import { breadcrumbJsonLd, localizedUrl } from '@/lib/seo';
import { LEGAL_UPDATED_AT } from '@/lib/data/legal';
import { formatDate } from '@/lib/utils/formatters';
import type { Locale } from '@/i18n/routing';

export async function LegalPage({ title, markdown, path }: { title: string; markdown: string; path: string }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('legal');
  const tn = await getTranslations('nav');
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tn('home'), url: localizedUrl(locale, '/') },
          { name: title, url: localizedUrl(locale, path) },
        ])}
      />
      <PageHeader tone="light" title={title} subtitle={t('lastUpdated', { date: formatDate(LEGAL_UPDATED_AT, locale) })} eyebrow={<Breadcrumbs items={[{ label: title }]} />} />
      <section className="section bg-white">
        <div className="container-content max-w-3xl">
          <BlogContent markdown={markdown} />
        </div>
      </section>
    </>
  );
}
