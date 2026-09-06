import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Clock, Eye, UserRound } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { BlogCard, BlogCover } from '@/components/blog/BlogCard';
import { BlogContent } from '@/components/blog/BlogContent';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { SocialShare } from '@/components/shared/SocialShare';
import { CTABanner } from '@/components/shared/CTABanner';
import { Newsletter } from '@/components/shared/Newsletter';
import { JsonLd } from '@/components/shared/JsonLd';
import { getBlogPostBySlug, getBlogPosts, getRelatedPosts } from '@/lib/api/content';
import { breadcrumbJsonLd, buildMetadata, localizedUrl, ORGANIZATION_JSONLD } from '@/lib/seo';
import { APP_URL } from '@/lib/utils/constants';
import { formatDate, formatNumber } from '@/lib/utils/formatters';
import type { Locale } from '@/i18n/routing';

export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: { locale: Locale; slug: string } };

export async function generateStaticParams() {
  const { posts } = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();
  const title = post.seo_title ?? ((locale === 'ar' && post.title_ar) || post.title);
  const description = post.seo_description ?? ((locale === 'ar' && post.excerpt_ar) || post.excerpt || '');
  return buildMetadata({ locale, path: `/blog/${post.slug}`, title, description, type: 'article', publishedTime: post.published_at ?? undefined, image: post.featured_image ?? undefined });
}

export default async function BlogPostPage({ params: { locale, slug } }: Props) {
  setRequestLocale(locale);
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();
  const [t, tc, tn, related] = await Promise.all([getTranslations('blog'), getTranslations('common'), getTranslations('nav'), getRelatedPosts(post, 3)]);

  const title = (locale === 'ar' && post.title_ar) || post.title;
  const excerpt = (locale === 'ar' && post.excerpt_ar) || post.excerpt || '';
  const content = (locale === 'ar' && post.content_ar) || post.content;
  const url = localizedUrl(locale, `/blog/${post.slug}`);
  const category = t(`categories.${post.category}` as never);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    image: post.featured_image ?? `${APP_URL}/images/og-image.png`,
    datePublished: post.published_at,
    dateModified: post.published_at,
    author: { '@type': 'Organization', name: post.author_name ?? ORGANIZATION_JSONLD.name },
    publisher: { '@type': 'Organization', name: ORGANIZATION_JSONLD.name, logo: { '@type': 'ImageObject', url: ORGANIZATION_JSONLD.logo } },
    mainEntityOfPage: url,
    inLanguage: locale === 'ar' ? 'ar-EG' : 'en',
    articleSection: category,
    keywords: post.tags.join(', '),
  };

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd,
          breadcrumbJsonLd([
            { name: tn('home'), url: localizedUrl(locale, '/') },
            { name: tn('blog'), url: localizedUrl(locale, '/blog') },
            { name: title, url },
          ]),
        ]}
      />
      <article>
        <header className="border-b border-card-border bg-white">
          <div className="container-content max-w-4xl py-10 md:py-14">
            <Breadcrumbs items={[{ label: tn('blog'), href: '/blog' }, { label: category }]} />
            <Link href={`/blog?category=${post.category}`} className="mt-5 inline-block rounded-pill bg-primary-50 px-3 py-1 text-caption font-bold text-primary-800">
              {category}
            </Link>
            <h1 className="mt-3 text-balance text-hero-m font-extrabold text-navy md:text-4xl md:leading-tight">{title}</h1>
            {excerpt && <p className="mt-4 text-lg text-content-secondary">{excerpt}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-small text-content-secondary">
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-4 w-4" aria-hidden />
                {t('by', { author: post.author_name ?? 'Hawwely' })}
              </span>
              {post.published_at && <time dateTime={post.published_at}>{t('publishedOn', { date: formatDate(post.published_at, locale) })}</time>}
              {post.reading_minutes != null && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden />
                  {tc('readingTime', { minutes: post.reading_minutes })}
                </span>
              )}
              {post.views > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-4 w-4" aria-hidden />
                  {tc('views', { count: formatNumber(post.views, locale) })}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="container-content max-w-4xl py-10">
          <div className="overflow-hidden rounded-card shadow-card">
            {post.featured_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.featured_image} alt={title} className="aspect-[2/1] w-full object-cover" />
            ) : (
              <BlogCover title={title} category={post.category} className="aspect-[2/1]" />
            )}
          </div>

          <BlogContent markdown={content} className="mt-10" />

          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <span className="text-small font-semibold text-navy">{t('tags')}:</span>
              {post.tags.map((tag) => (
                <Link key={tag} href={`/blog?q=${encodeURIComponent(tag)}`} className="rounded-pill border border-card-border px-3 py-1 text-caption text-content-secondary hover:border-primary hover:text-primary-700">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 border-t border-card-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold text-navy">{t('share')}</span>
            <SocialShare url={url} text={title} />
          </div>

          <CTABanner className="mt-12" />
        </div>
      </article>

      {related.length > 0 && (
        <section className="section bg-surface">
          <div className="container-content">
            <h2 className="section-title">{t('related')}</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {related.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
            <div className="mt-12">
              <Newsletter />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
