import { Clock, Eye } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { BlogPost } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';

const CATEGORY_STYLE: Record<string, string> = {
  guide: 'bg-navy text-white',
  comparison: 'bg-primary text-white',
  news: 'bg-warning text-white',
  tips: 'bg-gold text-navy',
};

export function BlogCard({ post, className, featured = false }: { post: BlogPost; className?: string; featured?: boolean }) {
  const t = useTranslations('blog');
  const tc = useTranslations('common');
  const locale = useLocale() as 'ar' | 'en';
  const title = (locale === 'ar' && post.title_ar) || post.title;
  const excerpt = (locale === 'ar' && post.excerpt_ar) || post.excerpt || '';
  const category = t(`categories.${post.category}` as never);

  return (
    <article className={cn('card card-hover group flex h-full flex-col overflow-hidden', className)}>
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-navy" aria-hidden tabIndex={-1}>
        {post.featured_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.featured_image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <BlogCover title={title} category={post.category} />
        )}
        <span className={cn('absolute start-3 top-3 rounded-pill px-3 py-1 text-caption font-bold shadow', CATEGORY_STYLE[post.category] ?? 'bg-navy text-white')}>{category}</span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className={cn('font-bold leading-snug text-navy group-hover:text-primary-700', featured ? 'text-xl md:text-2xl' : 'text-lg')}>
          <Link href={`/blog/${post.slug}`} className="focus-visible:outline-none">
            {title}
          </Link>
        </h3>
        <p className={cn('mt-2 flex-1 text-small text-content-secondary', featured ? 'line-clamp-4' : 'line-clamp-3')}>{excerpt}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-content-secondary">
          {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at, locale)}</time>}
          {post.reading_minutes != null && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {tc('readingTime', { minutes: post.reading_minutes })}
            </span>
          )}
          {post.views > 0 && (
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" aria-hidden />
              {tc('views', { count: formatNumber(post.views, locale) })}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

const COVER_GRADIENTS: Record<string, string> = {
  guide: 'from-navy via-navy-light to-primary-700',
  comparison: 'from-primary-700 via-primary to-primary-light',
  news: 'from-warning via-amber-500 to-gold',
  tips: 'from-gold via-amber-400 to-primary-light',
};

/** Decorative generated cover used when a post has no featured image. */
export function BlogCover({ title, category, className }: { title: string; category: string; className?: string }) {
  return (
    <div className={cn('hero-dots flex h-full w-full items-end bg-gradient-to-br p-5', COVER_GRADIENTS[category] ?? COVER_GRADIENTS.guide, className)}>
      <span className="line-clamp-2 text-lg font-extrabold leading-snug text-white drop-shadow md:text-xl">{title}</span>
    </div>
  );
}
