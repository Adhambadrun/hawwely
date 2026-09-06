import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogFilters } from '@/components/blog/BlogFilters';
import { PageHeader } from '@/components/shared/PageHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Newsletter } from '@/components/shared/Newsletter';
import { JsonLd } from '@/components/shared/JsonLd';
import { EmptyState } from '@/components/ui/EmptyState';
import { getBlogPosts } from '@/lib/api/content';
import { breadcrumbJsonLd, buildMetadata, localizedUrl } from '@/lib/seo';
import { BLOG_CATEGORIES } from '@/lib/utils/constants';
import type { Locale } from '@/i18n/routing';

export const revalidate = 3600;

type Props = { params: { locale: Locale }; searchParams: { category?: string; q?: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  return buildMetadata({ locale, path: '/blog', title: t('blogTitle'), description: t('blogDescription') });
}

export default async function BlogIndexPage({ params: { locale }, searchParams }: Props) {
  setRequestLocale(locale);
  const category = (BLOG_CATEGORIES as readonly string[]).includes(searchParams.category ?? '') ? (searchParams.category as string) : '';
  const q = (searchParams.q ?? '').slice(0, 80);
  const [t, tn, { posts }] = await Promise.all([getTranslations('blog'), getTranslations('nav'), getBlogPosts({ category: category || undefined, q: q || undefined })]);
  const [featured, ...rest] = posts;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tn('home'), url: localizedUrl(locale, '/') },
          { name: tn('blog'), url: localizedUrl(locale, '/blog') },
        ])}
      />
      <PageHeader title={t('title')} subtitle={t('subtitle')} eyebrow={<Breadcrumbs light items={[{ label: tn('blog') }]} />} />
      <section className="section bg-surface">
        <div className="container-content">
          <Suspense>
            <BlogFilters category={category} q={q} />
          </Suspense>

          {posts.length === 0 ? (
            <EmptyState className="mt-10" title={t('noPosts')} description={t('noPostsHint')} />
          ) : (
            <>
              {featured && !q && !category && (
                <div className="mt-8">
                  <BlogCard post={featured} featured className="md:grid md:grid-cols-2 [&>a]:aspect-auto [&>a]:min-h-[280px]" />
                </div>
              )}
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(featured && !q && !category ? rest : posts).map((p) => (
                  <BlogCard key={p.id} post={p} />
                ))}
              </div>
            </>
          )}

          <div className="mt-14">
            <Newsletter />
          </div>
        </div>
      </section>
    </>
  );
}
